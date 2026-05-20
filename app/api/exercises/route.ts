// app/api/exercises/route.ts
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword") ?? "";

    const exercises = await prisma.exercise.findMany({
      where: keyword
        ? {
            name: { contains: keyword, mode: "insensitive" },
          }
        : undefined,
      include: {
        category: true,
        muscles: { include: { muscle: true } },
        equipment: { include: { equipment: true } },
      },
      take: 20,
    });

    return Response.json(exercises);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch exercises" },
      { status: 500 },
    );
  }
}
