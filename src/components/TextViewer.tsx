import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

const RichTextViewer = ({ value }: { value: string }) => {
    const editor = useEditor({
        editorProps: {
            editable: () => false,
            attributes: {
                class:
                    "[&[contenteditable]]:focus:outline-none w-full overflow-auto",
            },
        },
        extensions: [
            StarterKit.configure({
                orderedList: {
                    HTMLAttributes: {
                        class: "list-decimal pl-4",
                    },
                },
                bulletList: {
                    HTMLAttributes: {
                        class: "list-disc pl-4",
                    },
                },
            }),
        ],
        content: value,
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [editor, value]);

    return <EditorContent editor={editor} />;
};

export default RichTextViewer;
