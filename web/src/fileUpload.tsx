import { Trash2, XCircle, type LucideProps, File } from 'lucide-react';
import { cn, getFileType, isImageType } from '@/utils';
import { toast } from 'sonner';

const CloseIcon = (props: LucideProps & { type?: 'delete' | 'xcircle' }) => {
    const I = props.type === 'delete' ? Trash2 : XCircle;
    return <I {...props} className={cn('absolute size-3 text-red-300 hover:text-red-500 hover:cursor-pointer', props.className)} />;
};

const FileType = (props: any) => {
    const type = getFileType('');
    const isImage = isImageType(type);
    if (true) {
        return <img src='https://img.alicdn.com/imgextra/i1/O1CN012NfNOj1Tjx7VTw6rg_!!6000000002419-2-tps-72-72.png' alt='' />;
    } else {
        return <File />;
    }
};

export default () => {
    const deleteFile = (file?: File) => {
        const isDeleteAll = !file;
        toast.error(isDeleteAll ? '确定要删除所有文件吗 ?' : '确定要删除这个文件吗 ?', {
            action: {
                label: '确定',
                onClick: () => {
                    if (isDeleteAll) {
                        // 删除所有文件
                    } else {
                        // 删除指定的多个文件
                    }
                }
            },
            position: 'bottom-center',
            closeButton: true,
            duration: 30000
        });
    };

    return (
        <div className='w-full h-20 p-2'>
            <div className='px-2 bg-gray-100 w-full h-full rounded-md flex items-center gap-4 relative overflow-x-auto'>
                {/* 文件项：包括文件图标和文件信息 */}
                {new Array(2).fill(0).map(() => (
                    <div className='flex-none bg-gray-200 h-12 rounded relative flex items-center gap-1 lg:gap-2.5 border-gray-300 border min-w-16 max-w-28 lg:max-w-52 p-1.5'>
                        {/* 文件项：包括文件图标容器 */}
                        <div className='relative flex shrink-0 items-center justify-center overflow-hidden rounded bg-accent/80 size-8 [&>svg]:size-5'>
                            <FileType />
                        </div>
                        <div data-slot='file-upload-metadata' dir='ltr' className='flex min-w-0 flex-1 flex-col'>
                            <span title={'xxxx'} className='truncate font-normal text-sm leading-snug'>
                                qqqqq.svg
                            </span>
                            <span className='truncate text-muted-foreground text-xs leading-snug'>4.3 KB</span>
                        </div>
                        <CloseIcon onClick={() => void deleteFile()} className='bottom-0.5 right-0.5 absolute' type='delete' />
                    </div>
                ))}
            </div>
            <CloseIcon className='top-0 right-0' onClick={() => void deleteFile()} />
        </div>
    );
};
