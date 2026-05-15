import { MessagingInbox } from "../../../components/messaging/MessagingInbox";

export default function MessagesManagerPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-8 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Messagerie</h1>
        <p className="text-sm text-gray-500 mt-1">
          Échangez avec les membres de votre équipe et le service RH.
        </p>
      </div>
      <div className="flex-1 min-h-0 px-8 pb-8">
        <MessagingInbox isRH={false} />
      </div>
    </div>
  );
}