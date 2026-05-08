import api from './api';

export interface AvatarTree {
  baseUrl: string;
  tree: {
    clients: {
      boys: string[];
      girls: string[];
    };
    professionals: {
      boys: string[];
      girls: string[];
    };
    responsibles: {
      boys: string[];
      girls: string[];
    };
  };
}

export const assetService = {
  async getAvatars(): Promise<AvatarTree> {
    const response = await api.get<AvatarTree>('/assets/avatars/');
    return response.data;
  },
};
