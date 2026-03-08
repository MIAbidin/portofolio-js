'use client';

import { Code2, Users, Trophy, Coffee } from 'lucide-react';

export default function StatsSection() {
  const stats = [
    { label: 'Years Experience', value: '3+', icon: Code2 },
    { label: 'Projects Completed', value: '15+', icon: Trophy },
    { label: 'Happy Clients', value: '10+', icon: Users },
    { label: 'Cups of Coffee', value: '999+', icon: Coffee },
  ];

  return (
    <section className="py-16 px-4 bg-navy-800 border-y border-navy-700">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="p-4 bg-navy-900 rounded-full mb-4 text-cyber-500 shadow-lg shadow-cyber-500/20">
                  <Icon size={32} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}