import React from 'react';
import { Button } from '@/shared';

interface ActionButton {
  variant: 'success' | 'primary' | 'warning' | 'info' | 'secondary';
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}

interface ItemCardProps {
  title: string;
  link: string;
  displayLink?: string;
  blogName?: string;
  blogLink?: string;
  description?: string;
  position?: number;
  isMatched?: boolean;
  blogId?: string;
  actions: ActionButton[];
}

export const ItemCard: React.FC<ItemCardProps> = ({
  title,
  link,
  displayLink,
  blogName,
  blogLink,
  description,
  position,
  isMatched = false,
  blogId,
  actions,
}) => {
  const cleanTitle = title.replace(/<[^>]*>/g, '');
  const cleanDescription = description?.replace(/<[^>]*>/g, '');
  const finalDisplayLink = displayLink || link.replace('://blog.', '://m.blog.');

  return (
    <React.Fragment>
      <div>
        <div>
          <div>
            {position && (
              <div>
                <span>{position}</span>
                {isMatched && blogId && <span>매칭!</span>}
                {blogId && <span>#{blogId}</span>}
              </div>
            )}

            <a href={finalDisplayLink} target="_blank" rel="noopener noreferrer">
              {cleanTitle}
            </a>

            {blogName && blogLink && (
              <p>
                <a href={blogLink} target="_blank" rel="noopener noreferrer">
                  {blogName}
                </a>
              </p>
            )}

            {description && <p>{cleanDescription}</p>}

            <p>{link}</p>
          </div>
        </div>

        <div>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              size="sm"
              icon={action.icon}
              onClick={action.onClick}
            >
              {action.children}
            </Button>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};