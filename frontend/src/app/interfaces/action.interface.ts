
export interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  action: () => void;
  category: 'image' | 'code' | 'document' | 'general';
}
