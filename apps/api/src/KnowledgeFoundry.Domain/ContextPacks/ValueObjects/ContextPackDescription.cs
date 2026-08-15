using KnowledgeFoundry.Domain.Common.Base;

namespace KnowledgeFoundry.Domain.ContextPacks.ValueObjects
{
    public sealed class ContextPackDescription : ValueObject
    {
        private ContextPackDescription()
        {
            Value = string.Empty;
        }
        public string Value { get; }

        public ContextPackDescription(string value)
        {
            ArgumentNullException.ThrowIfNull(value);

            Value = value.Trim();
        }

        protected override IEnumerable<object?> GetEqualityComponents()
        {
            yield return Value;
        }

        public override string ToString()
            => Value;

        public static implicit operator string(ContextPackDescription description)
            => description.Value;
    }
}
