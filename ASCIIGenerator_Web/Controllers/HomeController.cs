using Microsoft.AspNetCore.Mvc;
using SerilogConfiguration.Services;
using System.IO;

namespace SerilogConfiguration.Controllers
{
    [Route("[controller]")]
    public class HomeController : Controller
    {
        private readonly ILogger _logger;
        private readonly Generator _generator;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
            _generator = new Generator();
        }

        [Route("/")]
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [Route("Generate")]
        public async Task<IActionResult> Generate(IFormFile file)
        {
            string generatedPath = Path.Combine(Directory.GetCurrentDirectory(), "generated");
            Directory.CreateDirectory(generatedPath);

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            var filePath = Path.Combine(generatedPath, file.FileName);
            using (FileStream stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            try
            {
                string content = _generator.Generate(filePath, 50, false);
                string generatedFileName = Path.GetFileNameWithoutExtension(filePath);
                var txtFilePath = Path.Combine(generatedPath, generatedFileName + ".txt");
                System.IO.File.WriteAllText(txtFilePath, content);
                return Content(content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return StatusCode(500);
            }
        }
    }
}
