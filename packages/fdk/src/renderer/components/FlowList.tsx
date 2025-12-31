/**
 * Flow List
 * Grid of flow cards with status and source badges
 */
import { type FlowInfo } from '../hooks/useFlows';
import { FlowCard } from './flow-list/FlowCard';
import { EmptyFlowList } from './flow-list/EmptyFlowList';

interface FlowListProps {
  flows: FlowInfo[];
  search: string;
}

export function FlowList({ flows, search }: FlowListProps) {
  if (flows.length === 0) {
    return <EmptyFlowList search={search} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {flows.map((flow, index) => (
        <FlowCard key={flow.id} flow={flow} index={index} />
      ))}
    </div>
  );
}
