import { forwardRef, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Box } from '@mui/material';

/**
 * Virtualized Listbox component for MUI Autocomplete
 * Renders only visible items for optimal performance with large datasets
 *
 * Usage:
 * <Autocomplete
 *   ListboxComponent={VirtualizedListbox}
 *   ...
 * />
 */
const VirtualizedListbox = forwardRef(function VirtualizedListbox(props, ref) {
  const { children, ...other } = props;
  const items = Array.isArray(children) ? children : [];

  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated row height in pixels
    overscan: 5, // Number of items to render outside visible area
  });

  // Sync the ref with parent
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(parentRef.current);
      } else {
        ref.current = parentRef.current;
      }
    }
  }, [ref]);

  // If few items, use regular rendering
  if (items.length <= 20) {
    return (
      <Box
        component="ul"
        ref={parentRef}
        {...other}
        sx={{
          maxHeight: 400,
          overflow: 'auto',
          padding: 0,
          margin: 0,
          listStyle: 'none',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,.25) transparent',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.25)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,.35)',
            },
          },
          ...other.sx,
        }}
      >
        {children}
      </Box>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <Box
      component="ul"
      ref={parentRef}
      {...other}
      sx={{
        maxHeight: 400,
        overflow: 'auto',
        padding: 0,
        margin: 0,
        listStyle: 'none',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,.25) transparent',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,.25)',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,.35)',
          },
        },
        ...other.sx,
      }}
    >
      <Box
        sx={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          if (!item) return null;

          return (
            <Box
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {item}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});

export default VirtualizedListbox;
