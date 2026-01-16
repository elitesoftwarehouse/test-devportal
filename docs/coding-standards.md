# Standard di Codifica - test

**Versione:** 1.0  
**Data:** 16/01/2026  
**Autore:** DEV Agent  

---

## 1. Introduzione

Questo documento definisce gli standard di codifica per il progetto **test**, allineati:

- allo stack tecnologico effettivo del repository (Java, Spring‑based),
- all’architettura logica definita (layered, controller/service/repository),
- agli standard moderni per applicazioni enterprise.

L’obiettivo è garantire **consistenza**, **leggibilità**, **manutenibilità** e facilitare l’onboarding di nuovi sviluppatori.

> Nota: dove non è stato possibile dedurre convenzioni direttamente dal codice esistente, vengono proposte best practice da adottare in modo uniforme nel repository.

---

## 2. Standard Generali

- **Linguaggio:** Java 17 (o versione LTS definita nel progetto; in assenza di specifica usare 17 come riferimento)
- **Framework principali:** Spring Boot, Spring Web, Spring Data JPA (ove presenti)
- **Indentazione:** 4 spazi (vietato l’uso di tab)
- **Encoding:** UTF-8
- **Max Line Length:** 120 caratteri
- **Imports:**
  - Vietati i wildcard imports (`import com.example.*;`)
  - Ordinati alfabeticamente per package
  - Raggruppati: `java.*`, `javax.*`, `org.*`, `com.*`, quindi il resto
- **Spaziatura:**
  - Un solo spazio dopo le virgole e dopo gli operatori binari
  - Nessuno spazio prima di `;`
- **Brace style:**
  - Apertura `{` sulla stessa riga della dichiarazione
  ```java
  public class ExampleService {
      public void doSomething() {
          // ...
      }
  }
  ```
- **File:**
  - Un’unica classe pubblica per file
  - Nome file = nome classe pubblica
- **Commenti:**
  - Usare Javadoc per **API pubbliche** (controller, service, DTO esterni)
  - Commenti lineari `//` per chiarimenti locali di logica non ovvia
  - Evitare commenti ridondanti che spiegano l’ovvio

---

## 3. Convenzioni di Nomenclatura

### 3.1. Classi, Interfacce e Record

- **Stile:** `PascalCase`
- **Nome:** sostantivo o sintagma nominale
- **Suffissi raccomandati:**
  - Controller REST: `XxxController`
  - Service: `XxxService`
  - Interfaccia service opzionale: `XxxService` con `XxxServiceImpl`
  - Repository Spring Data: `XxxRepository`
  - DTO: `XxxDto`
  - Mapper: `XxxMapper`
  - Entity JPA: nome dominio singolare (`User`, `Project`, `Document`)

```java
public class ProjectController { }

public interface ProjectService { }

public class ProjectServiceImpl implements ProjectService { }

public interface ProjectRepository extends JpaRepository<Project, UUID> { }

public record ProjectDto(UUID id, String name, String description) { }
```

### 3.2. Metodi

- **Stile:** `camelCase`
- **Nome:** verbo o sintagma verbale, descrive l’azione

```java
public ProjectDto findById(UUID id) { }

public void generateDocumentation(UUID projectId, UUID templateId) { }

private boolean isValidStatus(String status) { }
```

Per metodi booleani:
- usare prefissi `is`, `has`, `can`, `should`:

```java
public boolean isActive() { }
public boolean hasPermission(User user, Project project) { }
```

### 3.3. Variabili, Campi e Parametri

- **Stile:** `camelCase`
- **Nome:** descrittivo, evitare abbreviazioni non standard

```java
String projectName;
int maxRetryCount;
boolean active;
UUID projectId;
List<DocumentDto> projectDocuments;
```

Campi di classe:
- Privati per default
- Usare `final` se non vengono riassegnati

```java
private final ProjectRepository projectRepository;
private RedisTemplate<String, Object> redisTemplate;
```

### 3.4. Costanti

- **Stile:** `UPPER_SNAKE_CASE`
- **Modificatori:** `public static final` o `private static final` a seconda della visibilità

```java
public static final int DEFAULT_PAGE_SIZE = 20;
private static final String REDIS_PROJECT_KEY_PREFIX = "project:";
private static final Duration DEFAULT_CACHE_TTL = Duration.ofMinutes(10);
```

### 3.5. Package

Struttura raccomandata (adattare `com.elite.test` o `com.elite.portal.test` alla root effettiva del progetto):

```text
com.elite.test
 ├─ common
 │   ├─ config
 │   ├─ exception
 │   ├─ logging
 │   └─ security
 └─ modules
     ├─ user
     │   ├─ controller
     │   ├─ service
     │   ├─ dto
     │   ├─ mapper
     │   ├─ repository
     │   └─ model
     ├─ project
     │   ├─ controller
     │   ├─ service
     │   ├─ dto
     │   ├─ mapper
     │   ├─ repository
     │   └─ model
     └─ documentation
         ├─ controller
         ├─ service
         ├─ dto
         ├─ mapper
         ├─ repository
         └─ model
```

Esempio di nomi di package:

```text
com.elite.test.modules.project.controller
com.elite.test.modules.project.service
com.elite.test.modules.project.dto
com.elite.test.modules.project.repository
com.elite.test.modules.project.model
```

---

## 4. Pattern Architetturali

Allineati all’architettura a layer:

- **Controller Layer (Web / API):** gestisce HTTP, mapping richieste/riposte, nessuna business logic.
- **Service Layer (Application / Domain):** contiene la business logic, orchestrazione transazioni, chiamate a repository e servizi esterni.
- **Repository Layer (Data Access):** incapsula l’accesso a PostgreSQL (Spring Data JPA / altre soluzioni) e ad altre sorgenti dati.

### 4.1. Controller Layer

Linee guida:

- Annotazioni:
  - `@RestController` per API REST (default preferito)
  - `@RequestMapping("/api/<resource>")` a livello classe
- Responsabilità:
  - Validazione input con `@Valid`
  - Mapping DTO ↔ dominio (direttamente o via mapper)
  - Gestione codici HTTP (`ResponseEntity`)
  - Nessuna logica di business o accesso diretto al repository

```java
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public Page<ProjectDto> listProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return projectService.findAll(PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProject(@PathVariable UUID id) {
        return projectService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ProjectDto> createProject(
            @Valid @RequestBody CreateProjectRequest request) {

        ProjectDto created = projectService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/generate")
    public ResponseEntity<GeneratedDocDto> generateDocumentation(
            @PathVariable UUID id,
            @Valid @RequestBody GenerateDocRequest request) {

        GeneratedDocDto result = projectService.generateDocumentation(id, request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(result);
    }
}
```

### 4.2. Service Layer

Linee guida:

- Annotazioni:
  - `@Service`
  - `@Transactional(readOnly = true)` a livello classe
  - `@Transactional` sui metodi che eseguono operazioni di scrittura
- Responsabilità:
  - Implementazione dei casi d’uso (use case)
  - Gestione transazioni
  - Interazione con cache Redis
  - Applicazione logica di autorizzazione a livello dominio (se non gestita con AOP/annotations)

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final GeneratedDocRepository generatedDocRepository;
    private final TemplateRepository templateRepository;
    private final DocumentGenerator documentGenerator;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public Page<ProjectDto> findAll(Pageable pageable) {
        return projectRepository.findAll(pageable)
                .map(ProjectMapper::toDto);
    }

    @Override
    public Optional<ProjectDto> findById(UUID id) {
        String cacheKey = "project:" + id;

        ProjectDto cached = (ProjectDto) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return Optional.of(cached);
        }

        return projectRepository.findById(id)
                .map(ProjectMapper::toDto)
                .map(dto -> {
                    redisTemplate.opsForValue().set(cacheKey, dto, Duration.ofMinutes(10));
                    return dto;
                });
    }

    @Override
    @Transactional
    public ProjectDto create(CreateProjectRequest request) {
        Project project = ProjectMapper.fromCreateRequest(request);
        Project saved = projectRepository.save(project);
        log.info("Created project {} by user {}", saved.getId(), request.ownerId());
        return ProjectMapper.toDto(saved);
    }

    @Override
    @Transactional
    public GeneratedDocDto generateDocumentation(UUID projectId, GenerateDocRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));

        Template template = templateRepository.findById(request.templateId())
                .orElseThrow(() -> new EntityNotFoundException("Template not found: " + request.templateId()));

        GeneratedDocument generated = documentGenerator.generate(project, template, request.parameters());

        GeneratedDocument saved = generatedDocRepository.save(generated);
        log.info("Generated documentation {} for project {}", saved.getId(), projectId);

        return GeneratedDocMapper.toDto(saved);
    }
}
```

### 4.3. Repository Layer

Linee guida:

- Usare **Spring Data JPA** ove possibile
- Metodi di query conformi alle naming convention Spring (`findByXxxAndYyy`)
- Per query complesse usare `@Query` con JPQL o QueryDSL a seconda degli standard di progetto

```java
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    Page<Project> findByOwnerId(UUID ownerId, Pageable pageable);

    List<Project> findByNameContainingIgnoreCase(String name);

    @Query("SELECT p FROM Project p JOIN FETCH p.documents WHERE p.id = :id")
    Optional<Project> findWithDocuments(@Param("id") UUID id);
}
```

---

## 5. Uso di Lombok

Lombok può essere utilizzato per ridurre boilerplate, seguendo linee guida chiare per evitare abusi.

- **Per Entity JPA:**
  - Preferire `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor(access = AccessLevel.PROTECTED)` se serve
  - Evitare `@Data` sulle entity (può creare problemi con `equals`/`hashCode` e lazy loading)

```java
@Entity
@Table(name = "project")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class Project {

    @Id
    @GeneratedValue
    private UUID id;

    private String name;

    @Column(length = 2000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    private User owner;
}
```

- **Per DTO:**
  - `@Data` o `record` (Java 16+) sono ammessi
  - Oppure `@Builder` per DTO complessi

```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProjectDto {
    private UUID id;
    private String name;
    private String description;
    private UUID ownerId;
}
```

- **Per Service/Component:**
  - `@RequiredArgsConstructor` per iniezione di dipendenze via costruttore
  - `@Slf4j` per logging

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentationService {
    private final GeneratedDocRepository generatedDocRepository;
}
```

---

## 6. Gestione degli Errori

### 6.1. Eccezioni personalizzate

Usare eccezioni specifiche per i casi di dominio più comuni:

```java
public class EntityNotFoundException extends RuntimeException {
    public EntityNotFoundException(String message) {
        super(message);
    }
}

public class BusinessRuleViolationException extends RuntimeException {
    public BusinessRuleViolationException(String message) {
        super(message);
    }
}
```

Esempio in service:

```java
Project project = projectRepository.findById(projectId)
        .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));
```

### 6.2. Gestione centralizzata (Controller Advice)

Definire un `@ControllerAdvice` globale:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
        ErrorResponse body = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "NOT_FOUND",
                ex.getMessage(),
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(BusinessRuleViolationException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessRuleViolationException ex) {
        ErrorResponse body = new ErrorResponse(
                HttpStatus.UNPROCESSABLE_ENTITY.value(),
                "BUSINESS_RULE_VIOLATION",
                ex.getMessage(),
                Instant.now()
        );
        return ResponseEntity.unprocessableEntity().body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .collect(Collectors.joining("; "));

        ErrorResponse body = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "VALIDATION_ERROR",
                message,
                Instant.now()
        );
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        ErrorResponse body = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "INTERNAL_ERROR",
                "Unexpected error",
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
```

`ErrorResponse`:

```java
public record ErrorResponse(
        int status,
        String code,
        String message,
        Instant timestamp
) { }
```

---

## 7. Logging Standards

Linee guida:

- Usare **Lombok `@Slf4j`** o logger SLF4J standard
- Non loggare dati sensibili (password, token JWT, dati personali in chiaro oltre lo stretto necessario)
- Usare placeholder `{}` per parametri, mai concatenazione di stringhe

Livelli:

- `TRACE`: tracciamento molto fine (evitare in produzione)
- `DEBUG`: dettagli per debugging (disabilitato di default in prod)
- `INFO`: eventi di business significativi (creazione progetto, generazione documentazione, login)
- `WARN`: situazioni anomale non bloccanti
- `ERROR`: errori che impediscono il completamento dell’operazione

Esempi:

```java
@Slf4j
@Service
public class DocumentGenerationService {

    public GeneratedDocument generate(Project project, Template template, Map<String, Object> params) {
        log.info("Starting document generation for project {} with template {}", project.getId(), template.getId());

        try {
            // ...
            log.debug("Generation parameters: {}", params);
            return generated;
        } catch (TemplateProcessingException e) {
            log.error("Failed to generate documentation for project {}: {}", project.getId(), e.getMessage(), e);
            throw e;
        }
    }
}
```

---

## 8. Security Best Practices

In coerenza con l’architettura (JWT, RBAC, PostgreSQL):

- **Autenticazione:**
  - Endpoint di login `/api/auth/login` deve:
    - Validare le credenziali
    - Non loggare password
    - Restituire access token + refresh token
- **Autorizzazione:**
  - Utilizzare `@PreAuthorize` o checks nel service per verificare ruolo e permessi:

```java
@PreAuthorize("hasRole('PM') or hasRole('ADMIN')")
public ProjectDto create(CreateProjectRequest request) { ... }

@PreAuthorize("@permissionEvaluator.hasProjectPermission(authentication, #projectId, 'VIEW')")
public ProjectDto findById(UUID projectId) { ... }
```

- **Validazione input:**
  - Usare Bean Validation (`jakarta.validation`) con `@Valid` sui DTO di request:

```java
public record CreateProjectRequest(
        @NotBlank String name,
        @Size(max = 2000) String description,
        @NotNull UUID ownerId
) { }
```

- **Accesso DB:**
  - Solo query parametrizzate (Spring Data JPA garantisce di default)
  - Nessuna concatenazione stringhe in query JPQL/SQL

- **Protezione dati:**
  - Non restituire stacktrace o messaggi di eccezioni interne al client
  - Mascherare identificativi sensibili nei log se necessario

---

## 9. Testing Standards

### 9.1. Tipologie di test

- **Unit Test:** su singole classi (service, mapper, utility)
- **Integration Test:** su integrazione con database, sicurezza, repository JPA
- **Web Layer Test:** test di controller con `@WebMvcTest`

### 9.2. Naming e struttura

- Nome classe di test: `NomeClasseTest`
  - es. `ProjectServiceImplTest`, `ProjectControllerTest`
- Naming dei metodi:
  - Inglese, descrittivo, con pattern:
    - `should<DoSomething>When<Condition>()`

```java
class ProjectServiceImplTest {

    @Test
    @DisplayName("Should create project when data is valid")
    void shouldCreateProjectWhenDataIsValid() {
        // Given
        // When
        // Then
    }
}
```

### 9.3. Esempi

**Unit test service con Mockito:**

```java
@ExtendWith(MockitoExtension.class)
class ProjectServiceImplTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectServiceImpl projectService;

    @Test
    void shouldFindProjectById() {
        UUID id = UUID.randomUUID();
        Project project = new Project();
        project.setId(id);
        project.setName("Test project");

        when(projectRepository.findById(id)).thenReturn(Optional.of(project));

        Optional<ProjectDto> result = projectService.findById(id);

        assertThat(result).isPresent();
        assertThat(result.get().id()).isEqualTo(id);
    }
}
```

**Test controller con `@WebMvcTest`:**

```java
@WebMvcTest(ProjectController.class)
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProjectService projectService;

    @Test
    void shouldReturnProjectWhenExists() throws Exception {
        UUID id = UUID.randomUUID();
        ProjectDto dto = new ProjectDto(id, "Test project", "desc", UUID.randomUUID());

        when(projectService.findById(id)).thenReturn(Optional.of(dto));

        mockMvc.perform(get("/api/projects/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("Test project"));
    }
}
```

---

## 10. Code Review Checklist

Da utilizzare in ogni merge request / pull request:

- [ ] Naming chiaro e coerente (classi, metodi, variabili, package)
- [ ] Nessuna logica di business nei controller
- [ ] Service annotati correttamente con `@Service` e `@Transactional`
- [ ] Repository rispettano naming Spring Data e non contengono logica di business
- [ ] Gestione errori centralizzata (`@RestControllerAdvice`) utilizzata
- [ ] Logging presente per eventi significativi, senza esporre dati sensibili
- [ ] Validazione input con `@Valid` e constraint appropriati
- [ ] Nessuna query SQL/JPQL costruita via concatenazione stringhe
- [ ] Test unitari scritti per nuova logica di business
- [ ] Copertura adeguata per i casi limite e di errore
- [ ] Nessun `TODO` critico lasciato senza issue tracciata
- [ ] Nessun valore hardcoded configurabile (config esterna / properties)
- [ ] Formattazione aderente agli standard (indentazione, lunghezza linee, imports)

---

Se ti serve, posso adattare questi standard a uno specifico modulo del repository (ad es. `backend`, `modules`, `src`) una volta note le convenzioni già presenti in quei package.