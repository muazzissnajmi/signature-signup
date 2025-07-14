
import * as React from 'react';

interface RegistrationPassEmailProps {
  name: string;
}

export const RegistrationPassEmail: React.FC<Readonly<RegistrationPassEmailProps>> = ({ name }) => (
  <div>
    <h1>Hello, {name}!</h1>
    <p>
      Thank you for registering! Your official Registration Pass is attached to this email as a PDF.
    </p>
    <p>
      Please have it ready when you arrive at the event. We look forward to seeing you.
    </p>
    <p>
      Best regards,
      <br />
      The Event Team
    </p>
  </div>
);