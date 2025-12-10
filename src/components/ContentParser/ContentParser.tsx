import { FC, Fragment, useMemo, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import useContentType from '@hooks/useContentType';
import unescape from 'lodash.unescape';

type ContentParserProps = {
  data: any;
  styles?: any;
  usePTag?: boolean;
};

const ContentParser: FC<ContentParserProps> = ({
  data,
  styles = {},
  usePTag = true,
}) => {
  const { componentList } = useContentType(styles, usePTag);
  const modifiedData = useMemo(
    () => unescape(data).replaceAll('</accordion><br>', '</accordion>'),
    [data],
  );

  if (!data) return null;

  return (
    <Fragment>
      <ReactMarkdown
        className={styles.content}
        components={componentList}
        remarkPlugins={[[remarkBreaks]]}
        rehypePlugins={[rehypeRaw]}
      >
        {modifiedData}
      </ReactMarkdown>
    </Fragment>
  );
};

export default memo(ContentParser);
