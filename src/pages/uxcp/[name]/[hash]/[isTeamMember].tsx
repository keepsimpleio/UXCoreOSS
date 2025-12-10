import { FC, useEffect } from 'react';
import { useRouter } from 'next/router';
import Spinner from '@components/Spinner';
import { parseUXCPLink } from '@lib/uxcp-helpers';

const UXCPLinkHandler: FC = () => {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      const { name, hash, isTeamMember } = router.query as {
        [key: string]: string;
      };

      if (!!name) {
        const biases = parseUXCPLink(hash);
        router.push(
          `/uxcp?name=${name}&biases=${biases}&isTeamMember=${Boolean(
            Number(isTeamMember),
          )}`,
          undefined,
          { shallow: true },
        );
      }
    }, 1000);
  }, [router]);

  return <Spinner visible />;
};

export default UXCPLinkHandler;
