import { motion } from 'motion/react';
import { MapPin, Building, GraduationCap, Globe, Linkedin } from 'lucide-react';
import { Badge } from '../ui/badge';

interface AboutSectionProps {
  user: {
    bio: string;
    location: string;
    institution: string;
    fieldOfStudy: string;
    website: string;
    interests: string[];
  };
}

export function AboutSection({ user }: AboutSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 space-y-6"
    >
      {/* Bio */}
      <div>
        <h3 className="text-gray-900 mb-3">אודות</h3>
        <p className="text-gray-600 leading-relaxed">{user.bio}</p>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span>{user.location}</span>
        </div>

        <div className="flex items-center gap-3 text-gray-600 hover:text-purple-600 transition-colors">
          <Building className="w-5 h-5 text-purple-600" />
          <span>{user.institution}</span>
        </div>

        <div className="flex items-center gap-3 text-gray-600 hover:text-green-600 transition-colors">
          <GraduationCap className="w-5 h-5 text-green-600" />
          <span>{user.fieldOfStudy}</span>
        </div>

        {user.website && (
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-blue-600" />
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              {user.website}
            </a>
          </div>
        )}
      </div>

      {/* Interests/Skills */}
      <div>
        <h4 className="text-gray-900 mb-3">תחומי עניין</h4>
        <div className="flex flex-wrap gap-2">
          {user.interests.map((interest, index) => (
            <motion.div
              key={interest}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 hover:from-blue-200 hover:to-purple-200 border border-blue-200">
                {interest}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
