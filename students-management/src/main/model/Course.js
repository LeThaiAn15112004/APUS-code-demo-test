export default class Course {
  constructor(id, course_code, course_name, credits, created_at, updated_at) {
    this.id = id
    this.course_code = course_code
    this.course_name = course_name
    this.credits = credits
    this.created_at = created_at
    this.updated_at = updated_at
  }
}
