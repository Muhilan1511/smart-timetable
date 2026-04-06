import { TimetableGeneration, ScheduledClass } from "../types.js";
import { repository } from "../db/repository.js";

interface ExportContext {
  timetable: TimetableGeneration;
  scheduledClasses: ScheduledClass[];
  departmentName: string;
  shiftName: string;
}

export const exportService = {
  async buildExportContext(timetableId: string): Promise<ExportContext> {
    const timetable = await repository.getTimetable(timetableId);
    if (!timetable) {
      throw new Error("Timetable not found");
    }

    const scheduledClasses = await repository.getScheduledClassesForTimetable(timetableId);

    // Load additional metadata (would come from DB in full implementation)
    const departmentName = `Department ${timetable.departmentId}`;
    const shiftName = `Shift ${timetable.shiftId}`;

    return {
      timetable,
      scheduledClasses,
      departmentName,
      shiftName
    };
  },

  generateJSON(context: ExportContext): string {
    const output = {
      metadata: {
        department: context.departmentName,
        shift: context.shiftName,
        academicYear: context.timetable.academicYear,
        semester: context.timetable.semester,
        generatedAt: context.timetable.publishedAt || context.timetable.createdAt,
        qualityScore: context.timetable.qualityScore,
        conflictCount: context.timetable.conflictCount
      },
      schedule: context.scheduledClasses.map((sc) => ({
        day: sc.dayOfWeek,
        time: `${sc.startTime}-${sc.endTime}`,
        batchId: sc.batchId,
        subjectId: sc.subjectId,
        facultyId: sc.facultyId,
        classroomId: sc.classroomId,
        type: sc.classType
      }))
    };

    return JSON.stringify(output, null, 2);
  },

  generateHTML(context: ExportContext): string {
    // Group classes by batch for better display
    const classesByBatch = new Map<string, ScheduledClass[]>();
    context.scheduledClasses.forEach((sc) => {
      if (!classesByBatch.has(sc.batchId)) {
        classesByBatch.set(sc.batchId, []);
      }
      classesByBatch.get(sc.batchId)!.push(sc);
    });

    let tableRows = "";
    const daysOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

    // Generate a table for each batch
    let batchTables = "";
    classesByBatch.forEach((classes, batchId) => {
      batchTables += `
        <h3>Batch: ${batchId}</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 8px;">Day</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Time</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Subject</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Faculty</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Classroom</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Type</th>
            </tr>
          </thead>
          <tbody>
`;

      const sortedClasses = classes.sort((a, b) => {
        const dayDiff = daysOrder.indexOf(a.dayOfWeek) - daysOrder.indexOf(b.dayOfWeek);
        if (dayDiff !== 0) return dayDiff;
        return a.startTime.localeCompare(b.startTime);
      });

      sortedClasses.forEach((sc) => {
        batchTables += `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${sc.dayOfWeek}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${sc.startTime}-${sc.endTime}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${sc.subjectId}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${sc.facultyId}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${sc.classroomId}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${sc.classType}</td>
            </tr>
`;
      });

      batchTables += `
          </tbody>
        </table>
`;
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Timetable - ${context.departmentName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background-color: #f9f9f9;
    }
    .header {
      background-color: #4CAF50;
      color: white;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .metadata {
      background-color: #f0f0f0;
      padding: 10px;
      margin-bottom: 20px;
      border-left: 4px solid #4CAF50;
    }
    h1 {
      margin: 0;
    }
    h3 {
      color: #333;
      margin-top: 20px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th {
      background-color: #4CAF50;
      color: white;
      padding: 12px;
      text-align: left;
    }
    td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Academic Timetable</h1>
    <p>${context.departmentName} - ${context.shiftName}</p>
  </div>
  
  <div class="metadata">
    <p><strong>Academic Year:</strong> ${context.timetable.academicYear}</p>
    <p><strong>Semester:</strong> ${context.timetable.semester}</p>
    <p><strong>Generated:</strong> ${new Date(context.timetable.publishedAt || context.timetable.createdAt).toLocaleString()}</p>
    <p><strong>Quality Score:</strong> ${context.timetable.qualityScore?.toFixed(2) ?? "N/A"}</p>
    <p><strong>Conflicts:</strong> ${context.timetable.conflictCount ?? 0}</p>
  </div>
  
  ${batchTables}
  
  <footer style="margin-top: 40px; text-align: center; color: #999; font-size: 12px;">
    <p>Generated by Smart Timetable Scheduler</p>
  </footer>
</body>
</html>
`;

    return html;
  }
};
