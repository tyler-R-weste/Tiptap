import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import styles from './TiptapCommentEditor.module.css';

interface ThreadItem {
    id: string;
    content: string;
}

const TiptapCommentEditor: React.FC = () => {
    const [threads, setThreads] = useState<ThreadItem[]>([
        { id: 'thread-1', content: '' }
    ]);

    const enterPressCount = useRef<number>(0); // Track consecutive Enter presses
    const ctrlAPressCount = useRef<number>(0); //This is for the selecting key press count
    const selectRef = useRef<boolean>(false); // this is for the all delete flag

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        onUpdate({ editor }) {
            // Handle editor content updates here if needed.
        },
        onCreate({ editor }) {
            // Set initial focus on the first thread.
            editor.commands.focus();
        },
    });

    const addThread = useCallback((content: string) => {
        const newThread: ThreadItem = {
            id: `thread-${threads.length + 1}`,
            content: content
        };
        console.log(newThread)
        setThreads((prevThreads) => [...prevThreads.filter((value:ThreadItem )=> value.id !== 'thread-1'),
            newThread,
            ...prevThreads.filter((value:ThreadItem )=> value.id === 'thread-1')]);
    }, [threads]);

    const removeThread = useCallback((threadId: string) => {
        if (threads.length > 1) {
            setThreads((prevThreads) =>
                prevThreads.filter((thread) => thread.id !== threadId)
            );
        }
        if(threads.length > 1)
        editor?.commands.setContent(threads[threads.length - 2].content);
    }, [threads]);


    const removeAll= useCallback(() => {
        setThreads([{ id: 'thread-1', content: '' }]);
    }, []);


    const handleKeyDown = (event: React.KeyboardEvent) => {
        const { key, shiftKey } = event;

        //Add New Item when Enter key double pressed
        if (key === 'Enter' && !shiftKey) {
            event.preventDefault(); 
            enterPressCount.current += 1; // Increment Enter press count  

            if (enterPressCount.current === 2) {
                // Create a new thread on the second Enter press  
                addThread(editor?.getHTML() || '');
                setTimeout(() => editor?.commands.focus(), 0)
                editor?.commands.setContent('');
                enterPressCount.current = 0; // Reset count  
            }
        }

        //Remove item when backspace pressed
    else if (key === 'Backspace') {
        if(selectRef.current)
        {
            removeAll();
            selectRef.current = false;
        }
        else {
            const testContent = editor?.getHTML().replaceAll("<p></p>","");
            if(testContent?.length == 0 && threads.length > 1)
            {
                removeThread(threads[threads.length - 2].id);
            }
        }
        
        setTimeout(() => editor?.commands.focus(), 0)
    }

    //else
    else {
        enterPressCount.current  = 0;
    }


    //For the Select all content
    if (event.ctrlKey && event.key === 'a') {  

        if (ctrlAPressCount.current === 0) {  
            // First CTRL+A press  
            ctrlAPressCount.current += 1;  
        } else if (ctrlAPressCount.current === 1) {  
            // Second CTRL+A press: select all content in the specific div  
            const elements = document.querySelector('body');  
                const selection = window.getSelection();  
                selection?.removeAllRanges();  
                const range = document.createRange();  

                range.selectNodeContents(elements!);  
                selection?.addRange(range);  
                selectRef.current = true;
            ctrlAPressCount.current = 0; // Reset count  
        }  
    } else {  
        // Reset count if any other key is pressed  
        ctrlAPressCount.current = 0;  
    }  
};

return (
    <div className={styles['editorboard']}>
        {threads.map((thread, index) => (
            <div key={`{${index}_thread.id}`} className={styles['thread-item']}>
                <div className={styles['avatarPanel']}>
                    <img src="/assets/images/avatar.jpg" alt="Avatar" className={styles["avatar"]} />
                    {index != threads.length - 1 && <div className={styles['crossLine']}> &nbsp;</div>}
                </div>
                <div className={styles['content']}>
                    <div className={styles['name']}><strong className={styles["displayName"]}>BEEIRL</strong><span className={styles["userName"]}>@b33irl</span></div>
                    {
                        index != threads.length - 1 ?
                            <div dangerouslySetInnerHTML={{ __html: threads[index].content }} className='customContent'/> :
                            <EditorContent
                                editor={editor}
                                onKeyDown={handleKeyDown}
                                className={styles['editor']}
                            />
                    }
                </div>
            </div>
        ))}
    </div>
);
};

export default TiptapCommentEditor;
