# Backend addition: freelancer's assigned projects

The "My work" page calls `GET /projects/assigned` (project-service). Add these 3 small changes.

## 1. ProjectRepository.java
Add one line inside the interface:

```java
List<Project> findByFreelancerIdOrderByCreatedAtDesc(Long freelancerId);
```

## 2. ProjectService.java
Add a method:

```java
public List<Project> assignedTo(Long freelancerId) {
    return projects.findByFreelancerIdOrderByCreatedAtDesc(freelancerId);
}
```

## 3. ProjectController.java
Add, next to `/mine`:

```java
@GetMapping("/assigned")
@PreAuthorize("hasRole('FREELANCER')")
public List<Project> assigned(Authentication auth) {
    return service.assignedTo((Long) auth.getPrincipal());
}
```

Restart project-service. No gateway change is needed, because `/projects/**` is already routed.
