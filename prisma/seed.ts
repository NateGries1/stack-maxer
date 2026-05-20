import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import data from "../exercises.json" with { type: "json" };

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Categories
  console.log("Seeding categories...");
  for (const name of data.categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 2. Equipment
  console.log("Seeding equipment...");
  for (const name of data.equipment) {
    await prisma.equipment.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 3. Muscle groups + muscles together
  console.log("Seeding muscle groups and muscles...");
  for (const [groupName, muscleNames] of Object.entries(data.muscle_groups)) {
    const group = await prisma.muscleGroup.upsert({
      where: { name: groupName },
      update: {},
      create: { name: groupName },
    });

    for (const muscleName of muscleNames) {
      await prisma.muscle.upsert({
        where: { name: muscleName },
        update: {},
        create: { name: muscleName, muscleGroupId: group.id },
      });
    }
  }

  // 4. Exercises
  console.log("Seeding exercises...");
  for (const ex of data.exercises) {
    const category = ex.category
      ? await prisma.category.findUnique({ where: { name: ex.category } })
      : null;

    let exercise = await prisma.exercise.findFirst({
      where: { name: ex.name, userId: null },
    });

    if (!exercise) {
      console.log(ex.name);
      exercise = await prisma.exercise.create({
        data: {
          name: ex.name,
          description: ex.description ?? null,
          video: ex.video ?? null,
          instructions: ex.instructions ?? [],
          variationsOn: ex.variations_on ?? [],
          categoryId: category?.id ?? null,
        },
      });
    }

    // Primary muscles
    for (const muscleName of ex.primary_muscles ?? []) {
      const muscle = await prisma.muscle.findUnique({
        where: { name: muscleName },
      });
      if (!muscle) continue;
      await prisma.exerciseMuscle.upsert({
        where: {
          exerciseId_muscleId: { exerciseId: exercise.id, muscleId: muscle.id },
        },
        update: {},
        create: {
          exerciseId: exercise.id,
          muscleId: muscle.id,
          isPrimary: true,
        },
      });
    }

    // Secondary muscles
    for (const muscleName of ex.secondary_muscles ?? []) {
      const muscle = await prisma.muscle.findUnique({
        where: { name: muscleName },
      });
      if (!muscle) continue;
      await prisma.exerciseMuscle.upsert({
        where: {
          exerciseId_muscleId: { exerciseId: exercise.id, muscleId: muscle.id },
        },
        update: {},
        create: {
          exerciseId: exercise.id,
          muscleId: muscle.id,
          isPrimary: false,
        },
      });
    }

    // Equipment
    for (const equipmentName of ex.equipment ?? []) {
      const eq = await prisma.equipment.findUnique({
        where: { name: equipmentName },
      });
      if (!eq) continue;
      await prisma.exerciseEquipment.upsert({
        where: {
          exerciseId_equipmentId: {
            exerciseId: exercise.id,
            equipmentId: eq.id,
          },
        },
        update: {},
        create: { exerciseId: exercise.id, equipmentId: eq.id },
      });
    }
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
