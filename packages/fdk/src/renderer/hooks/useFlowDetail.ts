import { useState, useEffect } from 'react';

interface Step {
  id: string;
  name: string;
  type: string;
  description?: string;
}

type Tab = 'steps' | 'yaml';

export function useFlowDetail(flowKey: string | undefined) {
  const [activeTab, setActiveTab] = useState<Tab>('steps');
  const [steps, setSteps] = useState<Step[]>([]);
  const [yaml, setYaml] = useState('');
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [loadingYaml, setLoadingYaml] = useState(false);

  useEffect(() => {
    if (!flowKey) return;

    if (activeTab === 'steps' && steps.length === 0) {
      setLoadingSteps(true);
      window.electron.flow
        .getSteps?.(flowKey)
        .then((result) => {
          if (result.success && result.steps) setSteps(result.steps);
        })
        .catch(() => {})
        .finally(() => setLoadingSteps(false));
    }

    if (activeTab === 'yaml' && !yaml) {
      setLoadingYaml(true);
      window.electron.flow
        .getYaml?.(flowKey)
        .then((result) => {
          if (result.success && result.yaml) setYaml(result.yaml);
        })
        .catch(() => {})
        .finally(() => setLoadingYaml(false));
    }
  }, [flowKey, activeTab, steps.length, yaml]);

  return { activeTab, setActiveTab, steps, yaml, loadingSteps, loadingYaml };
}
