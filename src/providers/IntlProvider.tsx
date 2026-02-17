import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';

interface Props {
  children: ReactNode;
  locale: string;
}

export default function IntlProvider({ children, locale }: Props) {
  let messages;
  try {
    const filePath = path.join(process.cwd(), 'src', 'locales', locale, 'messages.json');
    const file = fs.readFileSync(filePath, 'utf-8');
    messages = JSON.parse(file);
  } catch (error) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
