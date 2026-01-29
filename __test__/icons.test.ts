import { describe, it, expect } from 'vitest';
import Icon, { IconProps, IconSize } from '../src/components/icons';

describe('Icons', () => {
    it('should export Icon as default', () => {
        expect(Icon).toBeDefined();
    });

    it('should export IconProps type', () => {
        // Type check only - this will be caught by TypeScript
        const props: IconProps = {
            size: 'default',
        };
        expect(props).toBeDefined();
    });

    it('should export IconSize type', () => {
        // Type check only
        const size: IconSize = 'default';
        expect(size).toBeDefined();
    });
});

