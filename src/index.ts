import type { App } from 'vue';

// Import all components
import Anchor from './components/anchor';
import AnchorLink from './components/anchor/Link.vue';
import AutoComplete from './components/autoComplete';
import AutoCompleteOption from './components/autoComplete/Option.vue';
import Avatar from './components/avatar';
import BackTop from './components/backTop';
import AvatarGroup from './components/avatar/AvatarGroup.vue';
import Badge from './components/badge';
import Banner from './components/banner';
import Breadcrumb from './components/breadcrumb';
import BreadcrumbItem from './components/breadcrumb/BreadcrumbItem.vue';
import Button from './components/button';
import { ButtonGroup, SplitButtonGroup } from './components/button';
import Carousel from './components/carousel';
import Card from './components/card';
import { Meta } from './components/card';
import Cascader from './components/cascader';
import CardGroup from './components/card/CardGroup.vue';
import Checkbox, { CheckboxGroup } from './components/checkbox';
import Collapse from './components/collapse';
import CollapsePanel from './components/collapse/CollapsePanel.vue';
import Collapsible from './components/collapsible';
import Descriptions from './components/descriptions';
import DescriptionsItem from './components/descriptions/DescriptionsItem.vue';
import Divider from './components/divider';
import Dropdown from './components/dropdown';
import DropdownItem from './components/dropdown/DropdownItem.vue';
import DropdownMenu from './components/dropdown/DropdownMenu.vue';
import DropdownDivider from './components/dropdown/DropdownDivider.vue';
import DropdownTitle from './components/dropdown/DropdownTitle.vue';
import Empty from './components/empty';
import Form, {
    ArrayField,
    Label,
    ErrorMessage,
    Section,
    Slot,
    Group,
    Field,
    useFormApi,
    useFormState,
    useFieldApi,
    useFieldState,
} from './components/form';
import Highlight from './components/highlight';
import IconButton from './components/iconButton';
import Image, { PreviewInner, Preview, ImagePreview } from './components/image';
import Input, { TextArea } from './components/input';
import InputGroup from './components/input/InputGroup.vue';
import InputNumber from './components/inputNumber';
import Layout from './components/layout';
import Header from './components/layout/Header.vue';
import Footer from './components/layout/Footer.vue';
import Content from './components/layout/Content.vue';
import Sider from './components/layout/Sider.vue';
import List from './components/list';
import ListItem from './components/list/ListItem.vue';
import Modal from './components/modal';
// Notification 不是组件，而是包含静态方法的对象，不需要注册为组件，但仍需要导出
import Notification from './components/notification';
import Navigation from './components/navigation';
import { LocaleProvider, LocaleConsumer } from './components/locale';
import ConfigProvider from './components/configProvider';
import NavItem from './components/navigation/Item.vue';
import NavSub from './components/navigation/SubNav.vue';
import NavHeader from './components/navigation/Header.vue';
import NavFooter from './components/navigation/Footer.vue';
import OverflowList from './components/overflowList';
import Pagination from './components/pagination';
import Popconfirm from './components/popconfirm';
// ResizeObserver 是内部组件，不对外导出
// import ResizeObserver from './components/_resizeObserver';
import Popover from './components/popover';
import Progress from './components/progress';
import Radio, { RadioGroup } from './components/radio';
import Rating from './components/rating';
import Select from './components/select';
import SelectOption from './components/select/Option.vue';
import SelectOptionGroup from './components/select/OptionGroup.vue';
import Skeleton from './components/skeleton';
import SkeletonButton from './components/skeleton/SkeletonButton.vue';
import SkeletonAvatar from './components/skeleton/SkeletonAvatar.vue';
import SkeletonParagraph from './components/skeleton/SkeletonParagraph.vue';
import SkeletonTitle from './components/skeleton/SkeletonTitle.vue';
import SkeletonImage from './components/skeleton/SkeletonImage.vue';
import SideSheet from './components/sideSheet';
import Slider from './components/slider';
import Space from './components/space';
import Spin from './components/spin';
import Steps from './components/steps';
import Step from './components/steps/Step.vue';
import Switch from './components/switch';
import Tag, { TagGroup } from './components/tag';
import TagInput from './components/tagInput';
import Tabs from './components/tabs';
import TabPane from './components/tabs/TabPane.vue';
import Timeline from './components/timeline';
import TimePicker from './components/timePicker';
import DatePicker from './components/datePicker';
import Transfer, { DragHandle } from './components/transfer';
import { Sortable } from './components/_sortable';
// Toast 不是组件，而是包含静态方法的对象，不需要注册为组件，但仍需要导出
import Toast, { useToast, ToastFactory } from './components/toast';
import Upload from './components/upload';
import Tree from './components/tree';
import TreeNode from './components/tree/TreeNode.vue';
import TreeSelect from './components/treeSelect';
import Table, { Column } from './components/table';
import Calendar from './components/calendar';
import ColorPicker, { colorStringToValue } from './components/colorPicker';
import PinCode from './components/pinCode';
import TimelineItem from './components/timeline/TimelineItem.vue';
import Tooltip from './components/tooltip';
// Typography 组件及其子组件
// 默认导出已经包含了 Text, Title, Paragraph 作为子属性
import Typography from './components/typography';
// 单独导出子组件以便单独使用
import TypographyText from './components/typography/Text.vue';
import TypographyTitle from './components/typography/Title.vue';
import TypographyParagraph from './components/typography/Paragraph.vue';
// 也导出简短的组件名（与 React 版本对齐）
import { Text, Title, Paragraph } from './components/typography';
import Row from './components/grid/Row.vue';
import Col from './components/grid/Col.vue';
import { Resizable, ResizeGroup, ResizeItem, ResizeHandler } from './components/resizable';

// Export all icons
export * from './components/icons';

const components = [
    Anchor,
    AnchorLink,
    AutoComplete,
    AutoCompleteOption,
    Avatar,
    AvatarGroup,
    BackTop,
    Badge,
    Banner,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    ButtonGroup,
    SplitButtonGroup,
    Calendar,
    ColorPicker,
    PinCode,
    Carousel,
    Card,
    CardGroup,
    Meta,
    Cascader,
    Checkbox,
    CheckboxGroup,
    Col,
    Collapse,
    CollapsePanel,
    Collapsible,
    ConfigProvider,
    Descriptions,
    DescriptionsItem,
    Divider,
    Dropdown,
    DropdownDivider,
    DropdownItem,
    DropdownMenu,
    DropdownTitle,
    Empty,
    Footer,
    Form,
    ArrayField,
    Section,
    Group,
    Field,
    Label,
    ErrorMessage,
    Slot,
    Header,
    Highlight,
    IconButton,
    Image,
    PreviewInner,
    Preview,
    Content,
    Input,
    InputGroup,
    TextArea,
    InputNumber,
    Layout,
    List,
    ListItem,
    Modal,
    // Notification, // 不是组件，不需要注册
    Navigation,
    NavItem,
    NavSub,
    NavHeader,
    NavFooter,
    OverflowList,
    Pagination,
    Popconfirm,
    Popover,
    Progress,
    Radio,
    RadioGroup,
    Rating,
    // ResizeObserver, // 内部组件，不对外导出
    Resizable,
    ResizeGroup,
    ResizeItem,
    ResizeHandler,
    Row,
    Select,
    SelectOption,
    SelectOptionGroup,
    Sider,
    Skeleton,
    SkeletonAvatar,
    SkeletonButton,
    SkeletonImage,
    SkeletonParagraph,
    SkeletonTitle,
    SideSheet,
    Slider,
    Space,
    Spin,
    Step,
    Steps,
    Switch,
    Table,
    Column,
    Tabs,
    TabPane,
    Tag,
    TagGroup,
    TagInput,
    Timeline,
    TimelineItem,
    TimePicker,
    DatePicker,
    Tooltip,
    Transfer,
    DragHandle,
    Sortable,
    Tree,
    TreeNode,
    TreeSelect,
    Upload,
    // Toast, // 不是组件，不需要注册
    Typography,
    TypographyParagraph,
    TypographyText,
    TypographyTitle,
    // 也注册简短的组件名（与 React 版本对齐）
    Text,
    Title,
    Paragraph,
];

const install = (app: App): void => {
    components.forEach((component) => {
        // 类型守卫：确保 component 有 name 属性且是 Vue 组件
        if (!component || typeof component !== 'object') {
            return;
        }
        // 此时 component 已确保非 null，使用类型断言
        const componentObj = component as Record<string, unknown>;
        if ('name' in componentObj) {
            const name = componentObj.name;
            if (name && typeof name === 'string') {
                app.component(name, component as any);
            }
        }
    });
};

export {
    Anchor,
    AnchorLink,
    AutoComplete,
    AutoCompleteOption,
    Avatar,
    AvatarGroup,
    BackTop,
    Badge,
    Banner,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    ButtonGroup,
    SplitButtonGroup,
    Calendar,
    ColorPicker,
    colorStringToValue,
    PinCode,
    Carousel,
    Card,
    CardGroup,
    Meta,
    Cascader,
    Checkbox,
    CheckboxGroup,
    Col,
    Collapse,
    CollapsePanel,
    Collapsible,
    ConfigProvider,
    Content,
    Descriptions,
    DescriptionsItem,
    Divider,
    Dropdown,
    DropdownDivider,
    DropdownItem,
    DropdownMenu,
    DropdownTitle,
    Empty,
    Footer,
    Form,
    ArrayField,
    Section,
    Group,
    Field,
    Label,
    ErrorMessage,
    Slot,
    useFormApi,
    useFormState,
    useFieldApi,
    useFieldState,
    Header,
    Highlight,
    IconButton,
    Image,
    PreviewInner,
    Preview,
    ImagePreview,
    Input,
    InputGroup,
    TextArea,
    InputNumber,
    Layout,
    List,
    ListItem,
    Modal,
    Notification,
    Navigation,
    NavItem,
    NavSub,
    NavHeader,
    NavFooter,
    OverflowList,
    Pagination,
    Popconfirm,
    Popover,
    Progress,
    Radio,
    RadioGroup,
    Rating,
    // ResizeObserver, // 内部组件，不对外导出
    Resizable,
    ResizeGroup,
    ResizeItem,
    ResizeHandler,
    Row,
    Select,
    SelectOption,
    SelectOptionGroup,
    Sider,
    Skeleton,
    SkeletonAvatar,
    SkeletonButton,
    SkeletonImage,
    SkeletonParagraph,
    SkeletonTitle,
    SideSheet,
    Slider,
    Space,
    Spin,
    Step,
    Steps,
    Switch,
    Table,
    Column,
    Tabs,
    TabPane,
    Tag,
    TagGroup,
    TagInput,
    Timeline,
    TimelineItem,
    TimePicker,
    DatePicker,
    Toast,
    ToastFactory,
    useToast,
    Tooltip,
    Transfer,
    DragHandle,
    Sortable,
    Tree,
    TreeNode,
    TreeSelect,
    Upload,
    Typography,
    TypographyParagraph,
    TypographyText,
    TypographyTitle,
    // 导出简短的组件名（与 React 版本对齐，方便在 demo 中使用）
    Text,
    Title,
    Paragraph,
    LocaleProvider,
    LocaleConsumer,
};

export default {
    install,
};
