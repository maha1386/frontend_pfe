// app/dashboardc/messages/page.tsx

import { MessagingInbox } from "../../../components/messaging/MessagingInbox";

export default function MessagesCollaborateurPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-8 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Messagerie</h1>
        <p className="text-sm text-gray-500 mt-1">
          Contactez votre responsable RH pour toute question.
        </p>
      </div>
      <div className="flex-1 min-h-0 px-8 pb-8">
        <MessagingInbox isRH={false} />
      </div>
    </div>
  );
}