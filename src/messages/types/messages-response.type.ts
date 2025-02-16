import { MessageDetailed } from './message-detailed.type';

export type MessagesResponse = {
  messages: MessageDetailed[];
  total: number;
  page: number;
  pageSize: number;
};
