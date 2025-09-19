# Context Menu Implementation Guide

## Overview

This guide documents how to replicate the context menu system from the InVivo application. The implementation uses Redux Toolkit for state management and @szhsin/react-menu for the UI component.

## Dependencies

```json
{
  "@reduxjs/toolkit": "^2.8.2",
  "@szhsin/react-menu": "^4.1.0",
  "react": "^19.1.0",
  "react-redux": "^9.1.2",
  "lucide-react": "^0.469.0"
}
```

## File Structure

```
src/
├── store/reducers/
│   └── contextMenuReducer.ts        # Redux slice and hooks
├── components/context-menu/
│   ├── context-menu.tsx            # Main UI component
│   ├── hooks.ts                    # Specific context menu hooks
│   └── index.ts                    # Exports
├── lib/
│   └── getPosition.ts              # Position calculation utility
└── hooks/
    └── types.ts                    # TypeScript types
```

## Core Implementation

### 1. Redux State Management (`contextMenuReducer.ts`)

```typescript
import { useCallback, MouseEvent, ElementType } from 'react';
import { createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { getPosition } from '@/lib/getPosition';

interface ContextMenuOption {
  title: string;
  subTitle?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: ElementType;
  divider?: boolean;
}

interface ContextMenuState {
  position: {
    x: number;
    y: number;
  };
  options: ContextMenuOption[];
  show: boolean;
}

const initialState: ContextMenuState = {
  position: { x: 0, y: 0 },
  options: [],
  show: false,
};

export const contextMenuSlice = createSlice({
  name: 'contextMenu',
  initialState,
  reducers: {
    openContextMenu: (state, action) => {
      const { position, options } = action.payload as Omit<ContextMenuState, 'show'>;
      state.position = position;
      state.options = options;
      state.show = true;
    },
    closeContextMenu: (state) => {
      state.options = initialState.options;
      state.position = initialState.position;
      state.show = false;
    },
  },
});

// Hook to open context menu
export const useOpenContextMenu = () => {
  const dispatch = useDispatch();

  return useCallback(
    (evt: MouseEvent, options: ContextMenuOption[]) => {
      evt.preventDefault();
      evt.stopPropagation();

      const position = getPosition(evt);

      dispatch(
        contextMenuSlice.actions.openContextMenu({
          position,
          options,
        }),
      );
    },
    [dispatch],
  );
};

// Hook to close context menu
export const useCloseContextMenu = () => {
  const dispatch = useDispatch();

  return useCallback(() => {
    dispatch(contextMenuSlice.actions.closeContextMenu());
  }, [dispatch]);
};

// Hook to get context menu state
export const useContextMenuState = () => {
  const { position, options, show } = useSelector(
    (state: { contextMenu: ContextMenuState }) => state.contextMenu,
  );

  return { position, options, show };
};

export default contextMenuSlice.reducer;
```

### 2. Position Calculation Utility (`getPosition.ts`)

```typescript
import { MouseEvent } from 'react';

const GAP = 4;

export const getPosition = (evt: MouseEvent) => {
  if (evt.type === 'contextmenu') {
    return {
      x: evt.pageX,
      y: evt.pageY,
    };
  }

  const target = evt.target as Element;
  const { top, right, height } = target.getBoundingClientRect();

  return {
    x: right,
    y: top + height + GAP,
  };
};
```

### 3. Context Menu UI Component (`context-menu.tsx`)

```typescript
import { MenuItem, ControlledMenu } from '@szhsin/react-menu';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { useCloseContextMenu, useContextMenuState } from '@/store/reducers/contextMenuReducer';

export const ContextMenu = () => {
  const { options, position, show } = useContextMenuState();
  const closeContextMenu = useCloseContextMenu();

  const { x, y } = position;

  return (
    <ControlledMenu
      anchorPoint={{ x, y }}
      state={show ? 'open' : 'closed'}
      onClose={closeContextMenu}
      direction='left'
      menuClassName='text-sm bg-inv-slate text-inv-light-grey py-1 rounded-lg min-w-[8rem] overflow-hidden min-w-[14rem] z-20 shadow-[0px_0px_12px_2px_#E6E6E626]'
    >
      {options.map(({ title, subTitle, onClick, disabled, icon: Icon, divider }) => {
        const isClickable = !!onClick;

        return (
          <MenuItem
            key={title}
            disabled={disabled}
            className={cn(
              'outline-none',
              isClickable &&
                'hover:bg-inv-grayscale-500 hover:text-accent-foreground cursor-pointer',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
            onClick={isClickable ? onClick : () => {}}
          >
            <div className='flex flex-col px-3 py-2'>
              <Typography variant='small' className='flex items-center gap-2'>
                {title}
                {Icon && <Icon size={16} />}
              </Typography>
              {subTitle && <Typography variant='muted'>{subTitle}</Typography>}
            </div>
            {divider && <div className='h-[1px] bg-border w-full' />}
          </MenuItem>
        );
      })}
    </ControlledMenu>
  );
};
```

### 4. Example Context Menu Hook (`hooks.ts`)

```typescript
import { MouseEvent } from 'react';
import { Pencil } from 'lucide-react';
import { useOpenContextMenu } from '@/store/reducers/contextMenuReducer';

type UseOpenExampleContextMenuType = () => (evt: MouseEvent, id: string) => void;

export const useOpenExampleContextMenu: UseOpenExampleContextMenuType = () => {
  const openContextMenu = useOpenContextMenu();

  const getOptions = (id: string) => [
    {
      title: 'Edit',
      onClick: () => alert(`Edit ${id}`),
      icon: Pencil,
    },
    {
      disabled: true,
      title: 'Delete',
      onClick: () => alert(`Delete ${id}`),
    },
  ];

  return (evt, id) => {
    openContextMenu(evt, getOptions(id));
  };
};
```

## Redux Store Integration

Add the context menu reducer to your Redux store:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import contextMenuReducer from './reducers/contextMenuReducer';

export const store = configureStore({
  reducer: {
    contextMenu: contextMenuReducer,
    // ... other reducers
  },
});
```

## App-Level Integration

1. **Add the ContextMenu component to your root layout:**

```typescript
import { ContextMenu } from '@/components/context-menu';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Provider store={store}>
          {children}
          <ContextMenu />
        </Provider>
      </body>
    </html>
  );
}
```

2. **Use context menus in components:**

```typescript
import { useOpenExampleContextMenu } from '@/components/context-menu/hooks';

const MyComponent = () => {
  const openContextMenu = useOpenExampleContextMenu();

  return (
    <div
      onContextMenu={(evt) => openContextMenu(evt, 'item-123')}
      className="cursor-pointer"
    >
      Right-click me
    </div>
  );
};
```

## Advanced Usage Patterns

### 1. Complex Context Menu with Dynamic Options

```typescript
export const useOpenUserContextMenu = ({ name, email }) => {
  const openContextMenu = useOpenContextMenu();
  const logout = useLogout();
  const router = useRouter();

  const getOptions = () => [
    {
      title: name,
      subTitle: email,
      divider: true,
    },
    {
      title: 'Account Settings',
      onClick: () => router.push('/settings'),
      divider: true,
    },
    {
      title: 'Logout',
      onClick: logout,
    },
  ];

  return (evt) => {
    openContextMenu(evt, getOptions());
  };
};
```

### 2. Context Menu with Conditional Options

```typescript
export const useOpenItemContextMenu = ({ canEdit, canDelete }) => {
  const openContextMenu = useOpenContextMenu();

  const getOptions = (id: string) => [
    canEdit && {
      title: 'Edit',
      onClick: () => handleEdit(id),
      icon: Pencil,
    },
    canDelete && {
      title: 'Delete',
      onClick: () => handleDelete(id),
      icon: Trash,
    },
  ].filter(Boolean);

  return (evt, id) => {
    openContextMenu(evt, getOptions(id));
  };
};
```

## Styling Customization

The context menu styling uses Tailwind CSS classes. Key areas to customize:

1. **Menu container:** Update `menuClassName` in ControlledMenu
2. **Menu items:** Modify className in MenuItem
3. **Hover states:** Adjust hover classes
4. **Typography:** Use your Typography component variants

## Key Features

- **Global state management** with Redux Toolkit
- **Flexible positioning** based on event type (right-click vs click)
- **Dynamic options** with conditional rendering
- **Icon support** with Lucide React
- **Disabled states** for unavailable actions
- **Dividers** for visual separation
- **Subtitle support** for additional context
- **Accessible** through @szhsin/react-menu

## TypeScript Types

Define interfaces for your specific context menu parameters:

```typescript
export interface ItemContextMenuProps {
  projectId: string;
  itemId: string;
  canEdit: boolean;
  canDelete: boolean;
}

export interface ItemContextMenuParams {
  id: string;
  name: string;
  status: string;
}
```

This implementation provides a robust, reusable context menu system that can be easily adapted to different use cases while maintaining consistent behavior and styling across your application.