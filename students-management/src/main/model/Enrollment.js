export default class Enrollment {
    constructor(id, student_id, course_id, score, semester, created_at, updated_at) {
        this.id = id;
        this.student_id = student_id;
        this.course_id = course_id;
        this.score = score;
        this.semester = semester;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}