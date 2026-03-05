import React from 'react';
import { useQuery } from '@tanstack/react-query';

const QueryTest: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['test'],
    queryFn: () => Promise.resolve('React Query is working!')
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error occurred</div>;

  return <div>✅ {data}</div>;
};

export default QueryTest;