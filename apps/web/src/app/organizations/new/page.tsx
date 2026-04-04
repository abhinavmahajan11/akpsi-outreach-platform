import Link from 'next/link';

export const metadata = {
  title: 'Add Organization · AKPsi Outreach',
};

export default function NewOrganizationPage() {
  return (
    <div className="px-8 pt-8 pb-16 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link href="/organizations" className="text-slate-500 hover:text-slate-700">
          Organizations
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">Add Organization</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          Add Organization
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track a new company, nonprofit, or partner for outreach.
        </p>
      </div>

      {/* Form shell — submission wired in Stage 2 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">

        {/* Basic info */}
        <section className="px-6 py-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <FormField label="Organization Name" placeholder="e.g. Google, Make-A-Wish Foundation" required />
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Type"
                options={['Corporate', 'Nonprofit', 'Sponsor', 'Service Partner', 'Event Host', 'Fundraiser Collaborator']}
              />
              <FormField label="Industry" placeholder="e.g. Technology, Finance" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Location" placeholder="e.g. New York, NY" />
              <FormField label="Website" placeholder="e.g. google.com" />
            </div>
            <FormTextarea label="Description" placeholder="Brief description of this organization and the partnership opportunity…" />
          </div>
        </section>

        {/* Ownership */}
        <section className="px-6 py-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Ownership</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Committee Owner"
              options={['Professional Development', 'Community Service', 'Brotherhood', 'Fundraising', 'Marketing', 'Alumni Relations']}
            />
            <FormField label="Assigned Member" placeholder="e.g. Priya Nair" />
          </div>
        </section>

        {/* Outreach status */}
        <section className="px-6 py-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Outreach Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Initial Status"
              options={['No Contact', 'In Progress', 'Pending Response', 'Active Partner', 'Completed', 'Declined']}
            />
            <FormField label="Next Step" placeholder="e.g. Send intro email to recruiting team" />
          </div>
        </section>

        {/* Actions */}
        <section className="px-6 py-4 bg-slate-50 rounded-b-2xl flex items-center justify-between">
          <Link
            href="/organizations"
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Cancel
          </Link>
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-400">Form submission available in Stage 2</p>
            <button
              disabled
              className="rounded-xl bg-[#0d1f3c]/40 px-5 py-2 text-sm font-medium text-white cursor-not-allowed"
            >
              Save Organization
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── Local form field helpers ── */

function FormField({
  label,
  placeholder,
  required = false,
}: {
  label: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        disabled
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 placeholder:text-slate-300 cursor-not-allowed"
      />
    </div>
  );
}

function FormSelect({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <select
        disabled
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormTextarea({
  label,
  placeholder,
}: {
  label: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <textarea
        disabled
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 placeholder:text-slate-300 cursor-not-allowed resize-none"
      />
    </div>
  );
}
