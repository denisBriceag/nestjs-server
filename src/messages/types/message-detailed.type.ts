export type MessageDetailed = {
  id: string;
  message: string;
  userId: number;
  postedOn: Date;
  userName: string;
  likeCount: number;
  likedByUser: boolean;
};
