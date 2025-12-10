import React from 'react';
import { useRouter } from 'next/router';

import CertificateLayout from '@layouts/CertificateLayout';

import Spinner from '@components/Spinner';
import NotFoundPage from '../../404';

import { getCertificate } from '@api/uxcat/certificate';

import pageNotFoundData from '@data/404';

import type { TRouter } from '@local-types/global';

const Certificate = ({ userId, certificate }) => {
  const router = useRouter();
  const { locale } = router as TRouter;

  const name = `${certificate?.name} ${certificate?.surname}`;
  const date = new Date(certificate?.certificatedAt);
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  const link = `${process.env.NEXT_PUBLIC_DOMAIN}/user/${userId}/certificate`;

  if (!certificate) {
    return <NotFoundPage intl={pageNotFoundData[locale]} locale={locale} />;
  }

  return !certificate?.certificatedAt ? (
    <Spinner />
  ) : (
    <CertificateLayout
      name={name || ''}
      userId={certificate?.id || ''}
      link={link}
      receivedDate={`${day}.${month}.${year}`}
      locale={locale}
      username={userId}
    />
  );
};

export default Certificate;

export async function getServerSideProps(context) {
  const userId = context.params.userId;
  const certificate = await getCertificate(userId);
  return {
    props: {
      certificate,
      userId,
    },
  };
}
