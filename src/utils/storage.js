import { supabase } from '../lib/supabase';

// Default values
const DEFAULT_ADMIN = { username: 'kadir', password: 'kadir1071' };
const DEFAULT_SETTINGS = {
  packages: [
    { label: '30 Dakika', minutes: 30, price: 200 },
    { label: '1 Saat', minutes: 60, price: 300 },
    { label: '1.5 Saat', minutes: 90, price: 400 },
    { label: '2 Saat', minutes: 120, price: 500 },
  ],
  toleranceMinutes: 5,
};

// --- Admin ---
export async function getAdmin() {
  const { data, error } = await supabase.from('admin').select('*').limit(1).single();
  if (error) {
    console.error('getAdmin error:', error);
    return DEFAULT_ADMIN;
  }
  return { username: data.username, password: data.password };
}

export async function saveAdmin(admin) {
  const { data } = await supabase.from('admin').select('id').limit(1).single();
  if (data) {
    const { error } = await supabase.from('admin').update({ username: admin.username, password: admin.password }).eq('id', data.id);
    if (error) console.error('saveAdmin error:', error);
  } else {
    const { error } = await supabase.from('admin').insert({ username: admin.username, password: admin.password });
    if (error) console.error('saveAdmin insert error:', error);
  }
}

// --- Settings ---
export async function getSettings() {
  const { data, error } = await supabase.from('settings').select('*').limit(1).single();
  if (error || !data) {
    console.error('getSettings error:', error);
    // Insert defaults if no settings exist
    const row = { packages: DEFAULT_SETTINGS.packages, tolerance_minutes: DEFAULT_SETTINGS.toleranceMinutes };
    const { error: insertError } = await supabase.from('settings').insert(row);
    if (insertError) console.error('getSettings insert error:', insertError);
    return DEFAULT_SETTINGS;
  }
  return {
    packages: data.packages,
    toleranceMinutes: data.tolerance_minutes,
  };
}

export async function saveSettings(settings) {
  const { data } = await supabase.from('settings').select('id').limit(1).single();
  const row = {
    packages: settings.packages,
    tolerance_minutes: settings.toleranceMinutes,
  };
  if (data) {
    const { error } = await supabase.from('settings').update(row).eq('id', data.id);
    if (error) console.error('saveSettings error:', error);
  } else {
    const { error } = await supabase.from('settings').insert(row);
    if (error) console.error('saveSettings insert error:', error);
  }
}

// --- Active Children ---
export async function getActiveChildren() {
  const { data, error } = await supabase.from('active_children').select('*').order('start_time', { ascending: true });
  if (error) {
    console.error('getActiveChildren error:', error);
    return [];
  }
  return (data || []).map(mapChildFromDB);
}

export async function saveActiveChildren(children) {
  const { error: delError } = await supabase.from('active_children').delete().neq('id', '');
  if (delError) console.error('saveActiveChildren delete error:', delError);
  if (children.length > 0) {
    const { error } = await supabase.from('active_children').insert(children.map(mapChildToDB));
    if (error) console.error('saveActiveChildren insert error:', error);
  }
}

export async function addChild(child) {
  const { error } = await supabase.from('active_children').insert(mapChildToDB(child));
  if (error) console.error('addChild error:', error);
}

export async function removeChild(id) {
  const { error } = await supabase.from('active_children').delete().eq('id', id);
  if (error) console.error('removeChild error:', error);
}

// --- History ---
export async function getHistory() {
  const { data, error } = await supabase.from('history').select('*').order('completed_at', { ascending: false });
  if (error) {
    console.error('getHistory error:', error);
    return [];
  }
  return (data || []).map(mapHistoryFromDB);
}

export async function addToHistory(record) {
  const { error } = await supabase.from('history').insert(mapHistoryToDB(record));
  if (error) console.error('addToHistory error:', error);
}

export async function clearHistory() {
  const { error } = await supabase.from('history').delete().neq('id', '');
  if (error) console.error('clearHistory error:', error);
}

// --- Mapping helpers ---
function mapChildToDB(child) {
  return {
    id: child.id,
    child_name: child.childName,
    parent_name: child.parentName,
    parent_phone: child.parentPhone || '',
    package_label: child.packageLabel,
    package_minutes: child.packageMinutes,
    package_price: child.packagePrice,
    start_time: child.startTime,
    end_time: child.endTime,
  };
}

function mapChildFromDB(row) {
  return {
    id: row.id,
    childName: row.child_name,
    parentName: row.parent_name,
    parentPhone: row.parent_phone,
    packageLabel: row.package_label,
    packageMinutes: Number(row.package_minutes),
    packagePrice: Number(row.package_price),
    startTime: Number(row.start_time),
    endTime: Number(row.end_time),
  };
}

function mapHistoryToDB(record) {
  return {
    id: record.id,
    child_name: record.childName,
    parent_name: record.parentName,
    parent_phone: record.parentPhone || '',
    package_label: record.packageLabel,
    package_minutes: record.packageMinutes,
    package_price: record.packagePrice,
    start_time: record.startTime,
    end_time: record.endTime,
    used_minutes: record.usedMinutes,
    type: record.type,
    overtime_minutes: record.overtimeMinutes || 0,
    overtime_price: record.overtimePrice || 0,
    final_price: record.finalPrice,
    completed_at: record.completedAt,
  };
}

function mapHistoryFromDB(row) {
  return {
    id: row.id,
    childName: row.child_name,
    parentName: row.parent_name,
    parentPhone: row.parent_phone,
    packageLabel: row.package_label,
    packageMinutes: Number(row.package_minutes),
    packagePrice: Number(row.package_price),
    startTime: Number(row.start_time),
    endTime: Number(row.end_time),
    usedMinutes: Number(row.used_minutes),
    type: row.type,
    overtimeMinutes: Number(row.overtime_minutes),
    overtimePrice: Number(row.overtime_price),
    finalPrice: Number(row.final_price),
    completedAt: row.completed_at,
  };
}

// --- Backup ---
export async function exportBackup() {
  const [admin, settings, children, history] = await Promise.all([
    getAdmin(),
    getSettings(),
    getActiveChildren(),
    getHistory(),
  ]);
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), admin, settings, children, history }, null, 2);
}

export async function importBackup(jsonString) {
  const backup = JSON.parse(jsonString);
  if (!backup.version) throw new Error('Gecersiz yedek dosyasi');

  if (backup.admin) await saveAdmin(backup.admin);
  if (backup.settings) await saveSettings(backup.settings);
  if (backup.children) await saveActiveChildren(backup.children);
  if (backup.history) {
    await clearHistory();
    for (const record of backup.history) {
      await addToHistory(record);
    }
  }
  return true;
}
