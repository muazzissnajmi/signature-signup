
import * as React from 'react';

interface NotificationEmailProps {
  name: string;
}

export const NotificationEmail: React.FC<Readonly<NotificationEmailProps>> = ({ name }) => (
  <div>
    <h1>Hello, {name}!</h1>
    <p>
      This is a notification from the event team. We wanted to reach out with an update.
    </p>
    <p>
      If you have any questions, feel free to reply to this email.
    </p>
    <p>
      Best regards,
      <br />
      The Event Team
    </p>
  </div>
);
