import UXCGIcon from '@icons/UXCGIcon';
import UXCPIcon from '@icons/UXCPIcon';
import UXCatIcon from '@icons/UXCatIcon';
import UXCoreIcon from '@icons/UXCoreIcon';

export const navItems = [
  {
    label: 'UX Core',
    href: '/uxcore',
    page: 'uxcore',
    icon: <UXCoreIcon />,
  },
  {
    label: 'Guide',
    href: '/uxcg',
    page: 'uxcg',
    icon: <UXCGIcon />,
  },
  {
    label: 'Persona',
    href: '/uxcp',
    page: 'uxcp',
    icon: <UXCPIcon />,
  },
  {
    label: 'Awareness Test',
    href: '/uxcat',
    page: 'uxcat',
    icon: <UXCatIcon />,
  },
  {
    label: 'Bob - AI Assistant',
    href: 'https://chatgpt.com/g/g-BtuSiGF18-bob-bias-trickery-and-deception-by-uxcore-io/',
    page: '',
    icon: '',
  },
];
