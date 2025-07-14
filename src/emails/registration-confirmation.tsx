
import * as React from 'react';

interface RegistrationConfirmationEmailProps {
  name: string;
}

export const RegistrationConfirmationEmail: React.FC<Readonly<RegistrationConfirmationEmailProps>> = ({ name }) => (
  <div>
    <h1>Welcome, {name}!</h1>
    <p>
      Thank you for registering for our event. We are excited to have you.
    </p>
    <p>
      Your registration is confirmed. We will send you more details about the event soon.
    </p>
    <p>
      Best regards,
      <br />
      The Event Team
    </p>
  </div>
);
