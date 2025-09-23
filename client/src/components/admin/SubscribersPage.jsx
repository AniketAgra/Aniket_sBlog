import SectionHeader from './SectionHeader';
import SubscribersTable from './SubscribersTable';

export default function SubscribersPage() {
  return (
    <>
      <SectionHeader title="Subscribers" subtitle="Manage and export your newsletter subscribers" />
      <SubscribersTable />
    </>
  );
}
