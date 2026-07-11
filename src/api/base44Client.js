import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

const ENTITY_TABLE_MAP = {
  BlogPost: 'blog_posts',
  Feature: 'features',
  Language: 'languages',
  Lead: 'leads',
  Location: 'locations',
  Package: 'packages',
  Project: 'projects',
  Property: 'properties',
  PropertyType: 'property_types',
  SiteSettings: 'site_settings',
  User: 'users',
};

const COLUMN_ALIASES = {
  created_date: 'created_at',
  updated_date: 'updated_at',
  published_date: 'published_date',
};

const resolveColumn = (col) => COLUMN_ALIASES[col] || col;

const applyOrder = (query, order) => {
  if (!order) return query;
  const isDesc = order.startsWith('-');
  const rawColumn = isDesc ? order.substring(1) : order;
  const column = resolveColumn(rawColumn);
  return query.order(column, { ascending: !isDesc });
};

const createEntityRepo = (entityName) => {
  const table = ENTITY_TABLE_MAP[entityName] || entityName.toLowerCase();

  return {
    list: async (order, limit) => {
      let query = supabase.from(table).select('*');
      query = applyOrder(query, order);
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    filter: async (filterObj, order, limit) => {
      let query = supabase.from(table).select('*');
      if (filterObj && typeof filterObj === 'object') {
        for (const [key, value] of Object.entries(filterObj)) {
          if (value !== undefined && value !== null) {
            query = query.eq(resolveColumn(key), value);
          }
        }
      }
      query = applyOrder(query, order);
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    create: async (item) => {
      const { data, error } = await supabase
        .from(table)
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },

    bulkCreate: async (items) => {
      const { data, error } = await supabase
        .from(table)
        .insert(items)
        .select();
      if (error) throw error;
      return data || [];
    },
  };
};

export const base44 = {
  entities: {
    BlogPost: createEntityRepo('BlogPost'),
    Feature: createEntityRepo('Feature'),
    Language: createEntityRepo('Language'),
    Lead: createEntityRepo('Lead'),
    Location: createEntityRepo('Location'),
    Package: createEntityRepo('Package'),
    Project: createEntityRepo('Project'),
    Property: createEntityRepo('Property'),
    PropertyType: createEntityRepo('PropertyType'),
    SiteSettings: createEntityRepo('SiteSettings'),
    User: createEntityRepo('User'),
  },
  auth: {
    me: async () => ({
      id: 'admin-1',
      full_name: 'Emlak Yöneticisi',
      email: 'admin@emlaksitesi.com',
      role: 'admin',
    }),
    logout: () => {},
    redirectToLogin: () => {},
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(fileName, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName);
        return { file_url: urlData.publicUrl };
      },
      InvokeLLM: async ({ prompt }) => {
        console.log('AI prompt:', prompt);
        return {
          seo_title: 'Luxury Real Estate for Sale in Turkey | Modern Project',
          seo_description:
            'Discover exclusive luxury apartments and properties for sale in Turkey. Great investment opportunity.',
          slug: 'luxury-modern-property-for-sale-turkey',
          seo_keywords: 'turkey property, investment turkey, buy apartment',
          title: 'Premium Modern Residence Project',
          description:
            '<p>This exclusive real estate project offers state-of-the-art architecture combined with excellent location advantages in Turkey.</p>',
        };
      },
    },
  },
};
