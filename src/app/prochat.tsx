import { Dropdown, Popover, Select } from 'antd';
import React, { useState, useEffect, useMemo } from 'react';
import {
  DoubleLeftOutlined,
  DownOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { ProChat, ChatMessage } from '@ant-design/pro-chat';
import { useTheme } from 'antd-style';
import userImage from './user.svg';
import robotImage from './robot.svg';
import Services from './service';
import styles from './index.module.scss';


const modelList = ['Qwen2-7B-Instruct'];
const roleList = ['user', 'system'];

const HomePage: React.FC = () => {
  const theme = useTheme();
  const [chats, setChats] = useState<ChatMessage<Record<string, any>>[]>([]);
  const [currentModel, setCurrentModel] = useState<string>(modelList[0])
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [role, setRole] = useState<string>(roleList[0]);

  const onChatsChange = (chats: ChatMessage<Record<string, any>>[]) => {
    setChats(chats)
  };
 
  const onClickModel = (model: string) => {
    setCurrentModel(model)
  };

  const onOpenMenu = () => {
    setShowMenu(true)
  };

  const onCloseMenu = () => {
    setShowMenu(false)
  }

  const items = useMemo(() => {
    return modelList.map((item) => {
      return {
        key: item,
        label: <a onClick={() => onClickModel(item)}>{item}</a>,
      };
    });
  }, []);

  const handleRoleChange = (value: string) => {
    setRole(value);
  };

  const onRequest = async (messages: ChatMessage[]) => {
    const params = messages.map((message) => {
        const { role, content } = message;
        return {
            role,
            content,
        };
    })
    const response = await Services.queryChatResponse(params);
    if (!response.ok || !response.body) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        function push() {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                return;
              }
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line === 'data: [DONE]') {
                    controller.close();
                    return;
                }
                const message = line.replace('data: ', '');
                if (message) {
                    try {
                        const parsed = JSON.parse(message);
                        controller.enqueue(encoder.encode(parsed.choices[0].delta.content));
                        push();                
                    } catch (error) {
                        console.log('invalid JSON');
                    }
                }
              }
            })
            .catch((err: Error) => {
              controller.error(err);
            });
        }
        push();
      },
    });

    return new Response(readableStream);
  }
 
  return (
    <div className={styles.wrapper}>
      {showMenu && (
        <div className={styles.sideBar}>
            <div className={styles.menuTopBar}>
                <span>Config</span>
                <Popover content="Hide">
                    <DoubleLeftOutlined 
                        className={styles.menuOpenIcon} 
                        onClick={onCloseMenu} 
                    />
                </Popover>
            </div>
            <div className={styles.configWrapper}>
                <div className={styles.configItem}>
                    <span className={styles.label}>Role</span>
                    <Select
                        value={role}
                        style={{width: 120}}
                        onChange={handleRoleChange}
                        options={roleList.map((item) => {
                            return {
                                value: item,
                                label: item,
                            };
                        })}
                    />
                </div>
            </div>
        </div>
      )}
      <div className={styles.rightContent}>
        <div className={styles.topBar}>
          {!showMenu && (
            <Popover content="Menu">
                <MenuOutlined className={styles.menuIcon} onClick={onOpenMenu} />
            </Popover>
            )}
          <Dropdown menu={{ items }} className={styles.drop}>
            <a onClick={(e) => e.preventDefault()}>
              <span className={styles.title}>            
                {currentModel}
                <DownOutlined style={{marginLeft: 5}} />
              </span>
            </a>
          </Dropdown>
        </div>
        <div 
            style={{ background: theme.colorBgLayout }} 
            className={styles.chatBox}
        >
          <ProChat
            chats={chats}
            displayMode={'chat'}
            locale="en-US"
            helloMessage={"Let's start chatting~"}
            showTitle
            userMeta={{
              avatar: userImage,
              title: 'User',
            }}
            assistantMeta={{ avatar: robotImage, title: 'Assistant', backgroundColor: '#fff' }}
            onChatsChange={onChatsChange}
            request={onRequest}
          />
        </div>
      </div>
    </div>
  );
}

export default HomePage