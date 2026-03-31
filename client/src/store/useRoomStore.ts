import { create } from 'zustand'

type Message = {
  sender: string;
  text: string;
  time: string;
  type?: 'text' | 'image' | 'file';
  fileName?: string;
}

interface RoomStore {
  userName: string;
  setUserName: (name: string) => void;
  
  isMicOn: boolean;
  setIsMicOn: (val: boolean) => void;
  isVideoOn: boolean;
  setIsVideoOn: (val: boolean) => void;
  
  participantCount: number;
  setParticipantCount: (val: number | ((prev: number) => number)) => void;
  
  participantIds: string[];
  setParticipantIds: (val: string[] | ((prev: string[]) => string[])) => void;
  
  participantNames: Record<string, string>;
  setParticipantNames: (val: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  
  isHandRaised: boolean;
  setIsHandRaised: (val: boolean) => void;
  handRaises: Record<string, boolean>;
  setHandRaises: (val: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;

  messages: Message[];
  setMessages: (val: Message[] | ((prev: Message[]) => Message[])) => void;
  
  isChatOpen: boolean;
  setIsChatOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  
  isChatMinimized: boolean;
  setIsChatMinimized: (val: boolean) => void;

  isRecording: boolean;
  setIsRecording: (val: boolean) => void;
  
  isScreenSharing: boolean;
  setIsScreenSharing: (val: boolean) => void;

  popoutStates: Record<string, boolean>;
  setPopoutStates: (val: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  
  drags: Record<string, {x: number, y: number, w?: number, h?: number}>;
  setDrags: (val: Record<string, {x: number, y: number, w?: number, h?: number}> | ((prev: Record<string, {x: number, y: number, w?: number, h?: number}>) => Record<string, {x: number, y: number, w?: number, h?: number}>)) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  userName: "",
  setUserName: (userName) => set({ userName }),

  isMicOn: true,
  setIsMicOn: (isMicOn) => set({ isMicOn }),
  
  isVideoOn: true,
  setIsVideoOn: (isVideoOn) => set({ isVideoOn }),

  participantCount: 1,
  setParticipantCount: (val) => set(state => ({ participantCount: typeof val === 'function' ? val(state.participantCount) : val })),

  participantIds: [],
  setParticipantIds: (val) => set(state => ({ participantIds: typeof val === 'function' ? val(state.participantIds) : val })),

  participantNames: {},
  setParticipantNames: (val) => set(state => ({ participantNames: typeof val === 'function' ? val(state.participantNames) : val })),

  isHandRaised: false,
  setIsHandRaised: (isHandRaised) => set({ isHandRaised }),

  handRaises: {},
  setHandRaises: (val) => set(state => ({ handRaises: typeof val === 'function' ? val(state.handRaises) : val })),

  messages: [],
  setMessages: (val) => set(state => ({ messages: typeof val === 'function' ? val(state.messages) : val })),

  isChatOpen: false,
  setIsChatOpen: (val) => set(state => ({ isChatOpen: typeof val === 'function' ? val(state.isChatOpen) : val })),

  isChatMinimized: false,
  setIsChatMinimized: (isChatMinimized) => set({ isChatMinimized }),

  isRecording: false,
  setIsRecording: (isRecording) => set({ isRecording }),

  isScreenSharing: false,
  setIsScreenSharing: (isScreenSharing) => set({ isScreenSharing }),

  popoutStates: {},
  setPopoutStates: (val) => set(state => ({ popoutStates: typeof val === 'function' ? val(state.popoutStates) : val })),

  drags: {},
  setDrags: (val) => set(state => ({ drags: typeof val === 'function' ? val(state.drags) : val })),
}))
