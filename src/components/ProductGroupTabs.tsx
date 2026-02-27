'use client'

import type { ProductGroup } from '@/lib/utils/clustering'

interface Props {
  groups: ProductGroup[]
  activeGroup: string | null  // null = 전체
  onSelect: (groupId: string | null) => void
  keyword: string
}

export default function ProductGroupTabs({ groups, activeGroup, onSelect, keyword }: Props) {
  if (groups.length === 0) return null

  const totalCount = groups.reduce((sum, g) => sum + g.count, 0)

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">제품 그룹</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelect(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeGroup === null
              ? 'bg-indigo-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          전체 ({totalCount}건)
        </button>
        {groups.map(group => (
          <button
            key={group.id}
            onClick={() => onSelect(group.id)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              activeGroup === group.id
                ? 'bg-indigo-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <span className="font-medium">
              {group.label === '기타' ? '기타' : `${keyword} ${group.label}`}
            </span>
            <span className="ml-1.5 opacity-75">
              {group.count}건
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
