import { workspaceStatsEventsHandler } from 'src/workspace-stats/workspace-stats.events-handler';
import { bookingsEventsHandler } from '../bookings/bookings.events-handler';
import { customerFormsEventsHandler } from '../customer-forms/customer-forms.events-handler';
import { customerKycEventsHandler } from '../customer-kycs/customer-kycs.events-handler';
import { customersEventsHandler } from '../customers/customers.events-handler';
import { loansEventsHandler } from '../loans/loans.events-handler';
import { messageBoxesEventsHandler } from '../message-boxes/message-boxes.events-handler';
import { pluginZaloOasEventsHandler } from '../plugin-zalo-oas/plugin-zalo-oas.events-handler';
import { receiptsEventsHandler } from '../receipts/receipts.events-handler';
import { tagsEventsHandler } from '../tags/tags.events-handler';
import { tasksEventsHandler } from '../tasks/tasks.events-handler';
import { usersEventsHandler } from '../users/users.events-handler';
import { workspaceMembersEventsHandler } from '../workspace-members/workspace-members.events-handler';
import { workspaceEventsHandler } from '../workspaces/workspaces.events-handler';
import { EventsHandler } from './events.types';

function combineEventsHandlers(...eventHandlersMap: EventsHandler[]) {
  const combinedHandlers: EventsHandler = {};

  eventHandlersMap.map((eventHandlers) => {
    Object.entries(eventHandlers).forEach(([eventType, handlers]) => {
      combinedHandlers[eventType] = [
        ...(combinedHandlers[eventType] || []),
        ...handlers,
      ];
    });
  });

  return combinedHandlers;
}

export const eventsHandlers = combineEventsHandlers(
  usersEventsHandler,
  loansEventsHandler,
  customerFormsEventsHandler,
  tagsEventsHandler,
  workspaceMembersEventsHandler,
  customerKycEventsHandler,
  tasksEventsHandler,
  customersEventsHandler,
  messageBoxesEventsHandler,
  receiptsEventsHandler,
  bookingsEventsHandler,
  pluginZaloOasEventsHandler,
  workspaceEventsHandler,
  workspaceStatsEventsHandler,
);
