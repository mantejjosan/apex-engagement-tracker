import * as React from 'react';

export function EmailTemplate({ firstName }) {
  return (
    <div>
      <h1>Welcome, {firstName}!</h1>
    </div>
  );
}