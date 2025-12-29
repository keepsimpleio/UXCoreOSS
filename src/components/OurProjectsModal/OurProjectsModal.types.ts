export type OurProjectsModalProps = {
  title: string;
  onClose: () => void;
  projects?: {
    name: string;
    link: string;
    description: string;
    image: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
  }[];
  api: {
    link: string;
    linkName: string;
  };
  github: {
    link: string;
    linkName: string;
  };
  doneTxt?: string;
};
