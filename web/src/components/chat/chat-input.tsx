import * as React from 'react';
import { Textarea } from '..';
import { cn } from '@/utils';

interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(({ className, ...props }, ref) => {
    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        const textarea = e.target;
        textarea.style.height = 'auto'; // Reset the height to get the correct scrollHeight
        textarea.style.height = `${textarea.scrollHeight}px`; // Set the height to match the content
        props?.onChange?.(e);
    };

    return (
        <Textarea
            autoComplete='off'
            ref={ref}
            name='message'
            className={cn(
                'max-h-12 px-4 py-3 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-16 resize-none',
                className
            )}
            {...props}
            onChange={handleChange}
        />
    );
});

ChatInput.displayName = 'ChatInput';
export { ChatInput };
