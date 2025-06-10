import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils';
import { Avatar, AvatarImage, AvatarFallback, Button, ButtonProps } from '..';

import MessageLoading from './message-loading';
import './index.less';

// 匹配 http(s)://... 或 www. 开头或仅是域名的情况
const urlPattern =
    /(https?:\/\/)?(([0-9a-z.]+\.[a-z]+)|(([0-9]{1,3}\.){3}[0-9]{1,3}))(:[0-9]+)?(\/[0-9a-z%/.\-_]*)?(\?[0-9a-z=&%_\-]*)?(\#[0-9a-z=&%_\-]*)?/gi;

function replaceUrlsWithLinks(text: any): React.ReactNode {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // 使用 matchAll 获取所有匹配项及其索引
    for (const match of text.matchAll(urlPattern)) {
        const [url] = match;
        const index = match.index!;

        // 添加非链接部分
        if (index > lastIndex) {
            parts.push(text.slice(lastIndex, index));
        }

        // 添加 <a> 标签
        const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        parts.push(
            <a key={index} href={href} target='_blank' rel='noopener noreferrer' className='underline text-blue-500'>
                {url}
            </a>
        );

        lastIndex = index + url.length;
    }

    // 添加最后剩余的文本
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}

// ChatBubble
const chatBubbleVariant = cva('flex gap-2 w-full relative group', {
    variants: {
        variant: {
            received: 'self-start',
            sent: 'self-end flex-row-reverse'
        },
        layout: {
            default: '',
            ai: 'max-w-full w-full items-center'
        }
    },
    defaultVariants: {
        variant: 'received',
        layout: 'default'
    }
});

interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chatBubbleVariant> {}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(({ className, variant, layout, children, ...props }, ref) => (
    <div className={cn(chatBubbleVariant({ variant, layout, className }), 'relative group')} ref={ref} {...props}>
        {React.Children.map(children, (child) =>
            React.isValidElement(child) && typeof child.type !== 'string'
                ? React.cloneElement(child, {
                      variant,
                      layout
                  } as React.ComponentProps<typeof child.type>)
                : child
        )}
    </div>
));
ChatBubble.displayName = 'ChatBubble';

// ChatBubbleAvatar
interface ChatBubbleAvatarProps {
    src?: string;
    fallback?: React.ReactNode;
    className?: string;
}

const ChatBubbleAvatar: React.FC<ChatBubbleAvatarProps> = ({ src, fallback, className }) => (
    <Avatar className={className}>
        <AvatarImage src={src} alt='Avatar' />
        <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
);

// ChatBubbleMessage
const chatBubbleMessageVariants = cva('p-4', {
    variants: {
        variant: {
            received: 'bg-secondary text-secondary-foreground rounded-r-lg rounded-tl-lg',
            sent: 'bg-primary text-primary-foreground rounded-l-lg rounded-tr-lg'
        },
        layout: {
            default: '',
            ai: 'border-t w-full rounded-none bg-transparent'
        }
    },
    defaultVariants: {
        variant: 'received',
        layout: 'default'
    }
});

interface ChatBubbleMessageProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chatBubbleMessageVariants> {
    isLoading?: boolean;
}

const ChatBubbleMessage = React.forwardRef<HTMLDivElement, ChatBubbleMessageProps>(
    ({ className, variant, layout, isLoading = false, children, ...props }, ref) => {
        return (
            <div
                className={cn(chatBubbleMessageVariants({ variant, layout, className }), 'break-words max-w-full whitespace-pre-wrap')}
                ref={ref}
                {...props}
            >
                {isLoading ? (
                    <div className='flex items-center space-x-2'>
                        <MessageLoading />
                    </div>
                ) : (
                    replaceUrlsWithLinks(children)
                )}
            </div>
        );
    }
);
ChatBubbleMessage.displayName = 'ChatBubbleMessage';

// ChatBubbleTimestamp
interface ChatBubbleTimestampProps extends React.HTMLAttributes<HTMLDivElement> {
    timestamp: string;
}

const ChatBubbleTimestamp: React.FC<ChatBubbleTimestampProps> = ({ timestamp, className, ...props }) => (
    <div className={cn('text-xs text-center my-3 text-slate-300', className)} {...props}>
        {timestamp}
    </div>
);

// ChatBubbleAction
type ChatBubbleActionProps = ButtonProps & {
    icon: React.ReactNode;
};

const ChatBubbleAction: React.FC<ChatBubbleActionProps> = ({ icon, onClick, className, variant = 'ghost', size = 'icon', ...props }) => (
    <Button variant={variant} size={size} className={className} onClick={onClick} {...props}>
        {icon}
    </Button>
);

interface ChatBubbleActionWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'sent' | 'received';
    className?: string;
}

const ChatBubbleActionWrapper = React.forwardRef<HTMLDivElement, ChatBubbleActionWrapperProps>(
    ({ variant, className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'absolute top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                variant === 'sent' ? '-left-1 -translate-x-full flex-row-reverse' : '-right-1 translate-x-full',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
);
ChatBubbleActionWrapper.displayName = 'ChatBubbleActionWrapper';

export {
    ChatBubble,
    ChatBubbleAvatar,
    ChatBubbleMessage,
    ChatBubbleTimestamp,
    chatBubbleVariant,
    chatBubbleMessageVariants,
    ChatBubbleAction,
    ChatBubbleActionWrapper
};
