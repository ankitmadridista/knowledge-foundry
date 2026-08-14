using KnowledgeFoundry.Domain.Common.Base;
using KnowledgeFoundry.Domain.PromptTemplates.ValueObjects;

namespace KnowledgeFoundry.Domain.ContextPacks.ValueObjects
{
    public sealed class ContextVersionNumber : ValueObject
    {
        public int Value { get; }

        public ContextVersionNumber(int value)
        {
            if (value <= 0)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(value),
                    "Version number must be greater than zero.");
            }

            Value = value;
        }

        public ContextVersionNumber Next()
            => new(Value + 1);

        protected override IEnumerable<object?> GetEqualityComponents()
        {
            yield return Value;
        }

        public override string ToString()
            => $"v{Value}";

        public static implicit operator int(ContextVersionNumber version)
            => version.Value;
    }
}
