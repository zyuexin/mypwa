import Bowser from 'bowser';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { nanoid } from 'nanoid';

export type Action = { action: string; payload: { [key: string]: any } };

export enum WSSendJsonAction {
    SendNewMsg = 'sendNewMsg',
    DeleteMsg = 'deleteMsg'
}

type WSSendJson = {
    action: WSSendJsonAction;
    // 新消息
    message?: Omit<Message, 'file' | 'createAt'>;
    // 要删除的id列表
    deleteIds?: string[];
};

export type Message = {
    id: string;
    sender: string;
    senderType: 'desktop' | 'mobile';
    senderDetail: string;
    contentType: 'text' | 'file';
    text: string;
    file: ArrayBuffer;
    createAt: number;
};

export const formatTime = (unixTime: number) => {
    const date = new Date(unixTime * 1000); // 将秒转换为毫秒

    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // JavaScript中月份是从0开始的，所以要加1
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);

    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
};

export const isTimeThan20Minutes = (timestamp1: number, timestamp2: number): boolean => {
    const diffInSeconds = Math.abs(timestamp1 - timestamp2);
    return diffInSeconds > 1200; // 20分钟 = 20 * 60秒
};

export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};

export const waitAmoment = (delay: number = 1) => new Promise((res) => setTimeout(res, delay * 1000));

export const actionCreator = (action: Action['action'], payload: Action['payload']) => {
    return {
        action,
        payload
    };
};

// 编码函数，支持所有Unicode字符
const encodeBase64 = (str: string) => {
    return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        })
    );
};

// 解码函数，支持所有Unicode字符
const decodeBase64 = (str: string) => {
    return decodeURIComponent(
        Array.prototype.map
            .call(atob(str), function (c) {
                return '%' + c.charCodeAt(0).toString(16).padStart(2, '0');
            })
            .join('')
    );
};

const bowserParser = Bowser.getParser(window.navigator.userAgent);
const genSenderId = () => {
    const encoded = encodeBase64(JSON.stringify(bowserParser.getResult()));
    return encoded;
};

const getSenderDetail = () => {
    return {
        platform: bowserParser.getPlatformType() as 'desktop' | 'mobile',
        browserName: bowserParser.getBrowserName(),
        browserVersion: bowserParser.getBrowserVersion(),
        os: bowserParser.getOSName(),
        osVersion: bowserParser.getOSVersion()
    };
};

export const getFileType = (filename: string) => {
    return '';
};

export const isImageType = (filename: string) => {
    return ['jpg', 'jpeg', 'png', 'bmp', 'tif', 'tiff', 'svg', 'webp'].includes(filename);
};

export const generateNewMsg = (msg: string): WSSendJson => {
    return {
        action: WSSendJsonAction.SendNewMsg,
        message: {
            id: nanoid(),
            sender: genSenderId(),
            text: msg,
            senderType: getSenderDetail().platform,
            senderDetail: JSON.stringify(getSenderDetail()),
            contentType: 'text'
        }
    };
};

export const generateDeleteMsgJson = (ids: string | string[]): WSSendJson => {
    return {
        action: WSSendJsonAction.DeleteMsg,
        deleteIds: Array.isArray(ids) ? ids : [ids]
    };
};
