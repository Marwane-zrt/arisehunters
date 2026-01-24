import { supabase } from './supabase';
import { Routine, RoutineFormData } from '../types/routine';

export const fetchRoutines = async (): Promise<Routine[]> => {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching routines:', error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    color: item.color,
    habitIds: item.habit_ids || [],
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at)
  }));
};

export const createRoutine = async (routineData: RoutineFormData): Promise<Routine> => {
  const { data, error } = await supabase
    .from('routines')
    .insert({
      name: routineData.name,
      description: routineData.description,
      color: routineData.color,
      habit_ids: routineData.habitIds,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating routine:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color,
    habitIds: data.habit_ids || [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

export const updateRoutine = async (routineId: string, updates: Partial<RoutineFormData>): Promise<void> => {
  const updateData: any = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.color !== undefined) updateData.color = updates.color;
  if (updates.habitIds !== undefined) updateData.habit_ids = updates.habitIds;

  const { error } = await supabase
    .from('routines')
    .update(updateData)
    .eq('id', routineId);

  if (error) {
    console.error('Error updating routine:', error);
    throw error;
  }
};

export const deleteRoutine = async (routineId: string): Promise<void> => {
  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', routineId);

  if (error) {
    console.error('Error deleting routine:', error);
    throw error;
  }
};