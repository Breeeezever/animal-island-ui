import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { setup } from '@test/utils';
import { NoData } from './NoData';

describe('NoData', () => {
    it('缺省标题随场景变化，显式 null 不回退默认图标或标题', () => {
        const { container, rerender } = render(<NoData />);
        expect(screen.getByText('暂无数据')).toBeInTheDocument();
        expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
        rerender(<NoData variant="search" />);
        expect(screen.getByText('没有找到相关结果')).toBeInTheDocument();
        rerender(<NoData title={null} icon={null} description="请更换筛选条件" />);
        expect(screen.queryByText('没有找到相关结果')).not.toBeInTheDocument();
        expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
        expect(screen.getByText('请更换筛选条件')).toBeInTheDocument();
    });

    it('操作区保持键盘可用，extra 覆盖 children，原生状态语义可由业务指定', async () => {
        const user = setup();
        const restore = vi.fn();
        render(
            <NoData role="status" aria-label="列表空态" extra={<button onClick={restore}>恢复数据</button>}>
                被覆盖的操作
            </NoData>
        );
        expect(screen.getByRole('status', { name: '列表空态' })).toHaveTextContent('暂无数据');
        expect(screen.queryByText('被覆盖的操作')).not.toBeInTheDocument();
        await user.tab();
        await user.keyboard('{Enter}');
        expect(restore).toHaveBeenCalledTimes(1);
    });
});
