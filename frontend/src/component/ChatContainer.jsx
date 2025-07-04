import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { MoreVertical } from "lucide-react";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, deleteMessage, updateMessage } = useChatStore();
  const { subscribeToMessages, unsubscribeFromMessages } = useChatStore.getState();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [openMenuId, setOpenMenuId] = useState(null);


  useEffect(() => {
    if (!selectedUser) return;
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-zinc-500 text-center">No messages yet.</div>
        ) : (
          messages.map((message) => (
            
            <div
              key={message._id}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="w-10 h-10 rounded-full border overflow-hidden">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">{formatMessageTime(message.createdAt)}</time>
              </div>

              <div className="chat-bubble flex flex-col gap-2">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
             
                {message.text && <p>{message.text}</p>}
                
               {message.file && (
  <a href={message.file} target="_blank" rel="noopener noreferrer">
    View file
  </a>
)}
                
              </div>

              {message.senderId === authUser._id && (
                <div className="relative mt-1 flex justify-end">
                  <MoreVertical
                    className="w-4 h-4 cursor-pointer"
                    onClick={() =>
                      setOpenMenuId(openMenuId === message._id ? null : message._id)
                    }
                  />
                  {openMenuId === message._id && (
                    <div className="absolute right-0 mt-1 bg-base-200 rounded shadow p-1 z-10">
                      <button
                        className="block px-2 py-1 text-sm hover:bg-base-300 w-full text-left"
                        onClick={() => {
                          const newText = prompt("Edit your message:", message.text);
                          if (newText !== null) {
                            updateMessage(message._id, newText);
                          }
                          setOpenMenuId(null);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="block px-2 py-1 text-sm text-red-500 hover:bg-base-300 w-full text-left"
                        onClick={() => {
                          deleteMessage(message._id);
                          setOpenMenuId(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
