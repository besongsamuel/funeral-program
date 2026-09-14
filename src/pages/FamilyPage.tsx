import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMemorial } from '@/hooks/useMemorial';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { FamilyMember } from '@/lib/types';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function FamilyNode({ member, members, depth = 0 }: { member: FamilyMember; members: FamilyMember[]; depth?: number }) {
  const [flipped, setFlipped] = useState(false);
  const children = members.filter((m) => m.parentId === member.id);

  return (
    <div className="flex flex-col items-center">
      <motion.button
        onClick={() => setFlipped(!flipped)}
        whileHover={{ scale: 1.03 }}
        className="relative h-32 w-28 cursor-pointer"
        style={{ perspective: 1000 }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-full w-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-memorial-200 bg-white p-3 shadow-sm"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {member.photoUrl ? (
              <img src={member.photoUrl} alt="" className="mb-2 h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-memorial-100 text-lg font-semibold text-memorial-700">
                {member.fullName.charAt(0)}
              </div>
            )}
            <p className="text-center text-xs font-medium text-memorial-900">{member.fullName}</p>
            <p className="text-center text-[10px] text-gray-500">{member.relation}</p>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl border border-memorial-200 bg-memorial-50 p-3 text-center text-xs text-gray-700"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {member.bio ?? 'Beloved family member'}
          </div>
        </motion.div>
      </motion.button>

      {children.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-6">
          {children.map((child) => (
            <FamilyNode key={child.id} member={child} members={members} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FamilyPage() {
  const { data, isLoading } = useMemorial();
  const reduced = useReducedMotion();

  if (isLoading && !data) return null;

  const { familyMembers } = data;
  const roots = familyMembers.filter((m) => !m.parentId || !familyMembers.find((p) => p.id === m.parentId));
  const byRelation = familyMembers.reduce<Record<string, FamilyMember[]>>((acc, m) => {
    (acc[m.relation] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div>
      <section className="bg-memorial-900 py-16 text-white">
        <div className="container-memorial px-4 text-center">
          <h1 className="font-serif text-4xl font-bold">Family</h1>
          <p className="mt-3 text-memorial-200">Those who loved {data.memorial.fullName} most</p>
        </div>
      </section>

      <section className="section-padding overflow-x-auto">
        <div className="container-memorial">
          <SectionHeading title="Family" subtitle="Family contacts around the world" />
          <div className="flex flex-wrap justify-center gap-8 py-8">
            {roots.map((root, i) => (
              <motion.div
                key={root.id}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <FamilyNode member={root} members={familyMembers} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-memorial-50">
        <div className="container-memorial">
          <SectionHeading title="Family Members" />
          {Object.entries(byRelation).map(([relation, members]) => (
            <div key={relation} className="mb-8">
              <h3 className="mb-4 font-serif text-xl font-semibold text-memorial-800">{relation}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((m) => (
                  <div key={m.id} className="card flex items-center gap-4">
                    {m.photoUrl ? (
                      <img src={m.photoUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-memorial-100 text-xl font-semibold text-memorial-700">
                        {m.fullName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-memorial-900">{m.fullName}</p>
                      {m.bio && <p className="text-sm text-gray-600">{m.bio}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
